const openLogin = () => {
    window.location.href = `https://beste.schule/oauth/authorize?client_id=${CLIENT_ID}&scope=&response_type=code&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`
}

const getAccessToken = async() => {
    // Checking if there's a token in localStorage
    // content is being assigned not compared
    if (content = localStorage["bester-durchschnitt-app"]) {
        ACCESS_TOKEN = vigenere(content, "besterdurchschnitt", decrypt=true);
        return;
    }

    // Getting the authentication code from the url
    let code = window.location.href.match(/(?<=code=).+?(?=&)/g);
    if (!code) return

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
    if (ACCESS_TOKEN) {
        localStorage["bester-durchschnitt-app"] = vigenere(
            ACCESS_TOKEN, "besterdurchschnitt")
    }
}

// Server doesn't have it implemented yet
const deleteToken = async() => {
    let response = await fetch(`https://beste.schule/oauth/revoke`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: `token=${ACCESS_TOKEN}`
            + `&client_id=${CLIENT_ID}`
            + `&client_secret=${CLIENT_SECRET}`
    })
}

// Constants
let CLIENT_ID;
let CLIENT_SECRET;
let ACCESS_TOKEN;

// Use a differently configured app when testing the app locally
if (window.location.href.match(/^http:\/\/localhost:/g)) {
    CLIENT_ID = "59";
    CLIENT_SECRET = "u6Cc5niB2TebFYgMA9peSbbmcg6uBQ0U6iPJC5jy";
}
else {
    CLIENT_ID = "58";
    CLIENT_SECRET = "pemoySGLPS3ruxizFNi7qEgP9rsEiV8WbFWzqRLY";
}

