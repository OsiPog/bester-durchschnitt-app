const Authenticator = {
    access_token,
    getToken: async() => {
        // Checking if there's a token in localStorage
        // content is being assigned not compared
        if (content = localStorage.getItem("bester-durchschnitt-app")) {
            Authenticator.access_token = 
                vigenere(content, "besterdurchschnitt", decrypt=true);
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
                + `&client_id=${OAuthClient.id}`
                + `&client_secret=${OAuthClient.secret}`
                + `&${code}`
        })
        const response_json = await response.json();
        ACCESS_TOKEN = response_json.access_token;

        if (ACCESS_TOKEN) {
            localStorage.setItem("bester-durchschnitt-app", vigenere(
                ACCESS_TOKEN, "besterdurchschnitt"))
        }
    },

    // Deletes the access token from localStorage and reloads the page
    forgetToken: () => {
        localStorage.removeItem("bester-durchschnitt-app");
        window.location.reload(true);
    }
}

