const http = require('http'); // Importing the http module to create an HTTP server
require('dotenv').config(); // Load environment variables from a .env file
const { createHmac } = require('crypto'); // Importing the createHmac function from the crypto module to generate a secure signature
const axios = require('axios'); // Importing the axios module to make HTTP requests

// Create the HTTP server
const server = http.createServer({}, async (req, res) => {
    // Root URL: Serve a simple HTML page with a link to call the /getClientCustomer endpoint
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Call Example</title>
</head>
<body>
    <h1>API Call Example</h1>
    <a href="/getClientCustomer" target="_blank">[GET] /v1/client/customer</a>
</body>
</html>
        `);
    }
    // /getClientCustomer URL: Fetch and display data from the API by calling the callApi function
    else if (req.url === '/getClientCustomer') {
        const output = await callApi(); // Await the response from the callApi function
        const outputStr = JSON.stringify(output, null, 2); // Convert the response to a formatted JSON string
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(outputStr); // Send the formatted JSON as the response
    }
    // If the URL doesn't match, return a 404 Not Found error
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start the server on port 80
const PORT = 80;
server.listen(PORT, () => {
    console.log('Server running on port:', PORT);
});

// =================================================
// =================================================
// =================================================

// Function to make an API call and fetch data
async function callApi() {
    // Configuration: Load environment variables for Client ID, Secret, and API Endpoint
    const xClientId = process.env.CLIENT_ID;
    const xClientSecret = process.env.CLIENT_SECRET;
    const apiEndpoint = process.env.API_ENDPOINT;

    // Check if the required environment variables are defined
    if (!xClientId || xClientId.length == 0) {
        console.log('------------------------');
        console.log('CLIENT_ID is not defined in .env');
        console.log('------------------------');
        return;
    }
    if (!xClientSecret || xClientSecret.length == 0) {
        console.log('------------------------');
        console.log('CLIENT_SECRET is not defined in .env');
        console.log('------------------------');
        return;
    }
    if (!apiEndpoint || apiEndpoint.length == 0) {
        console.log('------------------------');
        console.log('API_ENDPOINT is not defined in .env');
        console.log('------------------------');
        return;
    }

    // Generate a current epoch timestamp in seconds
    const xTimestamp = Math.floor(Date.now() / 1000);

    // Define the query string for a GET request (parameters for the API call)
    const queryString = 'skip=0&take=1';

    // Define an empty request body (can be used for POST requests if needed)
    const requestBody = {};
    const requestBodyString = JSON.stringify(requestBody);

    // Create a combined string from the Client ID, timestamp, request body, and query string
    const combinedString = [xClientId, xTimestamp, requestBodyString, queryString].join('|');

    // Generate a HMAC SHA-256 signature using the Client Secret to securely sign the request
    const xSignature = createHmac('sha256', xClientSecret)
        .update(combinedString)
        .digest('hex');

    // Log the request headers for debugging
    console.log('------------------------');
    console.log('x-client-id:', xClientId);
    console.log('x-signature:', xSignature);
    console.log('x-timestamp:', xTimestamp);
    console.log('------------------------');

    // Construct the URL for the API request
    const url = `${apiEndpoint}/v1/client/customer?${queryString}`;

    try {
        // Make the GET request to the API
        const response = await axios.get(url, {
            headers: {
                'x-client-id': xClientId,
                'x-signature': xSignature,
                'x-timestamp': xTimestamp,
                'Content-Type': 'application/json', // Set the content type to JSON
            }
        });
        // Log and return the successful API response data
        console.log('Success:', response.data);
        return response.data;
    } catch (error) {
        // Handle errors from the API request and return the error details
        console.error('Error:', error.response ? error.response.data : error.message);
        return { error: 'Request failed', details: error.response ? error.response.data : error.message };
    }
}

// =================================================
// =================================================
// =================================================

