const CLIENT_ID = "58";
const CLIENT_SECRET = "pemoySGLPS3ruxizFNi7qEgP9rsEiV8WbFWzqRLY";
let ACCESS_TOKEN;
let REFRESH_TOKEN;

const openLogin = () => {
    window.location.href = `https://beste.schule/oauth/authorize?client_id=${CLIENT_ID}&scope=&response_type=code&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`
}

const getAccessToken = async() => {
    // Getting the authentication code from the url
    let code = window.location.href.match(/(?<=code=).+?(?=&)/g);

    // Send a post request to the oauth server to get the access token
    let response = await fetch("https://beste.schule/oauth/token", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code`
         + `&client_id=${CLIENT_ID}`
         + `&client_secret=${CLIENT_SECRET}`
         + `&code=${code}`
    })
    const response_json = await response.json();
    ACCESS_TOKEN = response_json.access_token;
}

// Server doesn't have it implemented yet
const deleteToken = async() => {
    let response = await fetch(`https://beste.schule/oauth/revoke`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: `token=${ACCESS_TOKEN}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    })
}