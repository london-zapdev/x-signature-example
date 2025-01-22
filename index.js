const { createHmac } = require('crypto');

// =============================================
// Configuration
// =============================================

// Set your Client ID and Client Secret
// You can find these in the settings menu after logging in
const xClientId = '<client_id>';
const xClientSecret = '<client_secret>';

// =============================================
// Timestamp
// =============================================

// Generate the current epoch timestamp (in seconds)
// You can verify the timestamp at https://www.epochconverter.com/
const xTimestamp = Math.floor(Date.now() / 1000);

// =============================================
// Request Data
// Example of GET https://zapman.net/api/v1/client/customer?skip=0&take=1
// =============================================

// Define the query string for a GET request (default is an empty string)
const queryString = 'skip=0&take=1';

// Define the JSON body for a POST request (default is an empty object)
const requestBody = {};
const requestBodyString = JSON.stringify(requestBody);

// =============================================
// Signature Generation
// =============================================

// Combine values to construct a unique string for the signature
const combinedString = [xClientId, xTimestamp, requestBodyString, queryString].join('|');

// Generate the HMAC SHA-256 signature using the Client Secret
const xSignature = createHmac('sha256', xClientSecret)
    .update(combinedString)
    .digest('hex');

// =============================================
// Debug Output
// =============================================

// Print the values for debugging
console.log('------------------------');
console.log('x-client-id:', xClientId);
console.log('x-signature:', xSignature);
console.log('x-timestamp:', xTimestamp);
console.log('------------------------');