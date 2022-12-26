// Globals
let ACCESS_TOKEN;
let ACCESS_TOKEN_ID; // not used yet

const getToken = async() => {
    // Checking if there's a token in localStorage
    // content is being assigned not compared
    if (content = localStorage["bester-durchschnitt-app"]) {
        ACCESS_TOKEN = vigenere(content, "besterdurchschnitt", decrypt=true);
        return;
    }

    // Getting the authentication code from the url
    const code = window.location.href.match(/code=.+?(?=&)/g);
    if (!code) return

    // Send a post request to the oauth server to get the access token
    const response = await fetch("https://beste.schule/oauth/token", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code`
            + `&client_id=${CLIENT_ID}`
            + `&client_secret=${CLIENT_SECRET}`
            + `&${code}`
    })
    const response_json = await response.json();
    ACCESS_TOKEN = response_json.access_token;

    if (ACCESS_TOKEN) {
        localStorage.setItem("bester-durchschnitt-app", vigenere(
            ACCESS_TOKEN, "besterdurchschnitt"))
    }
}

// Deletes the ACCESS_TOKEN from localStorage and reloads the page
const forgetToken = () => {
    delete localStorage["bester-durchschnitt-app"];
    window.location.reload(true);
}

// That doesn't work yet
const deleteToken = async() => {
    const response = await fetch(`https://beste.schule/oauth/tokens/${ACCESS_TOKEN_ID}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    })
}

