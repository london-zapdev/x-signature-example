require('dotenv').config();
const { createHmac } = require('crypto');
const axios = require('axios');

const exampleApiCall = async () => {

    // =============================================
    // Configuration
    // =============================================

    // Set your Client ID and Client Secret
    // You can find these in the settings menu after logging in
    const xClientId = process.env.CLIENT_ID;
    const xClientSecret = process.env.CLIENT_SECRET;
    const apiEndpoint = process.env.API_ENDPOINT;

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

    // =============================================
    // Timestamp
    // =============================================

    // Generate the current epoch timestamp (in seconds)
    // You can verify the timestamp at https://www.epochconverter.com/
    const xTimestamp = Math.floor(Date.now() / 1000);

    // =============================================
    // Request Data
    // =============================================

    // Define the query string for a GET request (default is an empty string)
    const queryString = '';

    // Define the JSON body for a POST request (default is an empty object)
    const requestBody = {
        "customer_account_uuid": '00000000-0000-0000-0000-000000000000', // Replace this with your customer's UUID
        "amount": 2, // Example amount 
        "currency": "thb",
        "payment_method": "qr",
        "callback_url": "https://merchant.site/handleCallback", // Callback URL to receive data when the transaction is successful
        "redirect_url": "https://merchant.site/thankyou", // Redirects the payer's browser when the transaction is successful
        "merchant_order_id": "ORDER_ID_1234" // A reference ID for your system's order; this data will be sent back in the callback response
    };
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

    // =============================================
    // Make a request
    // =============================================

    const url = `${apiEndpoint}/v1/client/tx/deposit`;

    // Make a POST request to the API
    axios.post(url, requestBody, {
        // Set required authentication headers for the API request
        headers: {
            'x-client-id': xClientId,
            'x-signature': xSignature,
            'x-timestamp': xTimestamp,
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            // Log success message when the request completes successfully
            console.log('Success:');
            console.log(JSON.stringify(response.data, null, 2));
        })
        .catch(error => {
            // Log the HTTP status code if the request fails
            console.error('Error HTTP status code:', error.status);
            console.error('Error message:', error.response.data);
        });

}
exampleApiCall();