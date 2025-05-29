# LlamaParse Test

A simple Node.js application that provides a web interface for parsing documents using the LlamaParse API. This tool allows you to upload documents and extract their text content while preserving structure and formatting.

## Features

- 📄 Upload and parse various document formats
- 🔄 Real-time parsing status updates
- 💾 Automatic JSON output generation
- 🌐 Simple web interface
- 🛡️ CORS enabled for cross-origin requests
- 🧹 Automatic cleanup of temporary files

## Project Structure

```
llamaparse-test/
├── public/
│   └── index.html          # Web interface (add your HTML file here)
├── output/                 # Generated parsed results (auto-created)
├── uploads/                # Temporary file storage (auto-created)
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- LlamaParse API key from [LlamaIndex](https://cloud.llamaindex.ai)

## Installation

1. **Clone or download this project**
   ```bash
   git clone <your-repo-url>
   cd llamaparse-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   - Open `server.js`
   - Replace the placeholder API key on line 12:
   ```javascript
   const LLAMAPARSE_API_KEY = 'your-actual-api-key-here';
   ```

4. **Create the HTML interface**
   - Create a `public` folder if it doesn't exist
   - Add your `index.html` file to the `public` folder

## Usage

### Starting the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your PORT environment variable).

### Using the API

**Endpoint:** `POST /api/parse`

**Parameters:**
- `file`: The document file to parse (multipart/form-data)

**Example using cURL:**
```bash
curl -X POST \
  -F "file=@/path/to/your/document.pdf" \
  http://localhost:3000/api/parse
```

**Example Response:**
```json
{
  "success": true,
  "message": "Document parsed successfully",
  "outputFile": "/path/to/output/parsed_document.json",
  "data": {
    "jobId": "job-123456",
    "status": "SUCCESS",
    "parsedContent": "Extracted text content...",
    "metadata": { ... }
  }
}
```

### Output Files

Parsed documents are automatically saved to the `output` folder as JSON files with the following structure:

```json
{
  "originalFileName": "document.pdf",
  "parsedAt": "2025-05-29T10:30:00.000Z",
  "content": {
    "jobId": "job-123456",
    "status": "SUCCESS",
    "parsedContent": "Extracted text content...",
    "metadata": { ... }
  }
}
```

## API Configuration

The application uses the following LlamaParse API endpoints:
- **Upload:** `https://api.cloud.llamaindex.ai/api/parsing/upload`
- **Status:** `https://api.cloud.llamaindex.ai/api/parsing/job/{jobId}`
- **Results:** `https://api.cloud.llamaindex.ai/api/parsing/job/{jobId}/result/markdown`

### Parsing Instructions

The default parsing instruction is:
```
"Parse this document and extract all text content, preserving structure and formatting."
```

You can modify this in the `server.js` file on line 26.

## Error Handling

The application includes comprehensive error handling for:
- Missing files
- API failures
- Parsing timeouts (30 attempts max)
- File cleanup on errors

## Environment Variables

You can customize the application using environment variables:

- `PORT`: Server port (default: 3000)
- `LLAMAPARSE_API_KEY`: Your LlamaParse API key (recommended for production)

**Example with environment variables:**
```bash
LLAMAPARSE_API_KEY=your-key-here PORT=8000 npm start
```

## Dependencies

### Production Dependencies
- **express**: Web framework for Node.js
- **multer**: Middleware for handling multipart/form-data
- **form-data**: Library to create readable "multipart/form-data" streams
- **node-fetch**: A light-weight module for making HTTP requests
- **cors**: Middleware to enable CORS

### Development Dependencies
- **nodemon**: Automatically restarts the server during development

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Security**: Never commit your actual API key to version control
2. **File Upload Limits**: Consider adding file size limits for production use
3. **Input Validation**: Add additional validation for uploaded files
4. **Rate Limiting**: Implement rate limiting for production deployments

## Troubleshooting

### Common Issues

1. **"No file uploaded" error**
   - Ensure you're sending the file with the key name "file"
   - Check that the Content-Type is multipart/form-data

2. **API authentication errors**
   - Verify your API key is correct and active
   - Check that you have sufficient API credits

3. **Parsing timeouts**
   - Large documents may take longer to process
   - Check the document format is supported by LlamaParse

4. **Port already in use**
   - Change the port using: `PORT=8000 npm start`

### Debugging

Enable verbose logging by adding console.log statements or use the development mode:
```bash
npm run dev
```

## License

This project is provided as-is for educational and testing purposes.

## Support

For LlamaParse API issues, visit: [LlamaIndex Documentation](https://docs.llamaindex.ai)

For application issues, please check the console logs and ensure all dependencies are properly installed.
