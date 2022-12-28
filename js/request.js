// Sends a GET request to the server using the ACCESS_TOKEN to authenticate,
// that request is awaited and the result of the request is converted to a JSON
// this conversion is awaited too.
// Returns the answer to the request as JSON
const requestJSON = async(route) => {
    let response;
    try {
        response = await fetch(`https://beste.schule/api/${route}`, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
    }
    // If the token got deleted from the server this request will throw and
    // error. To fix this get a new token.
    catch {
        // Deletes the token from localStorage and reloads
        Authenticator.forgetToken();
    }

    // Return only the data attribute because meta is irrelevant
    return (await response.json()).data
}