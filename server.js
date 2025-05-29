// server.js - Simple Express server for LlamaParse
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for all routes
app.use(cors());
app.use(express.static('public')); // Serve your HTML file from 'public' folder

const LLAMAPARSE_API_KEY = 'llx-3xY3a5kloBeBTN95hIYtAShFnV8LxVjbUIhkkD9Wakjz2tY3'; // Replace with your actual API key
const LLAMAPARSE_BASE_URL = 'https://api.cloud.llamaindex.ai';

// Upload and parse endpoint
app.post('/api/parse', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.originalname);

        // Step 1: Upload to LlamaParse
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        formData.append('parsing_instruction', 'Parse this document and extract all text content, preserving structure and formatting.');

        const uploadResponse = await fetch(`${LLAMAPARSE_BASE_URL}/api/parsing/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LLAMAPARSE_API_KEY}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        const jobId = uploadResult.id;

        console.log('Upload successful, job ID:', jobId);

        // Step 2: Poll for results
        const parsedResult = await pollForResults(jobId);

        // Step 3: Save to JSON file
        const jsonData = {
            originalFileName: req.file.originalname,
            parsedAt: new Date().toISOString(),
            content: parsedResult
        };

        const outputPath = path.join(__dirname, 'output', `parsed_${req.file.originalname.replace(/\.[^/.]+$/, '')}.json`);
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: 'Document parsed successfully',
            outputFile: outputPath,
            data: parsedResult
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: error.message });
    }
});

async function pollForResults(jobId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`${LLAMAPARSE_BASE_URL}/api/parsing/job/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${LLAMAPARSE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`Polling attempt ${attempt + 1}: ${result.status}`);

        if (result.status === 'SUCCESS') {
            // Get the actual parsed content
            const contentResponse = await fetch(`${LLAMAPARSE_BASE_URL}/api/parsing/job/${jobId}/result/markdown`, {
                headers: {
                    'Authorization': `Bearer ${LLAMAPARSE_API_KEY}`
                }
            });

            if (!contentResponse.ok) {
                throw new Error(`Failed to get parsed content: ${contentResponse.status}`);
            }

            const parsedContent = await contentResponse.text();
            
            return {
                jobId: jobId,
                status: result.status,
                parsedContent: parsedContent,
                metadata: result
            };
        } else if (result.status === 'ERROR') {
            throw new Error('Parsing failed: ' + (result.error || 'Unknown error'));
        }

        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Parsing timed out');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to:');
    console.log('1. Replace LLAMAPARSE_API_KEY with your actual API key');
    console.log('2. Put your HTML file in the "public" folder');
    console.log('3. Install dependencies: npm install express multer form-data node-fetch cors');
});
