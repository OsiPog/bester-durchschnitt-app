const Authenticator = {
    access_token: null,
    
    getToken: async() => {
        // Checking if there's a token in localStorage
        // content is being assigned not compared
        if (content = localStorage.getItem("bester-durchschnitt-app")) {
            Authenticator.access_token = 
                vigenere(content, "besterdurchschnitt", decrypt=true);
            return;
        }

        // Getting the authentication code from the url
        const code = URLParameterHandler.getAll()["code"];
        if (!code) return

        // Send a post request to the oauth server to get the access token
        const response = await (await fetch(
            "https://beste.schule/oauth/token", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=authorization_code`
                + `&client_id=${OAuthClient.id}`
                + `&client_secret=${OAuthClient.secret}`
                + `&code=${code}`
        })).json()
        Authenticator.access_token = response.access_token;

        if (Authenticator.access_token) {
            localStorage.setItem("bester-durchschnitt-app", vigenere(
                Authenticator.access_token, "besterdurchschnitt"))
        }
    },

    // Deletes the access token from localStorage and reloads the page
    forgetToken: () => {
        localStorage.removeItem("bester-durchschnitt-app");
        window.location.reload(true);
    },
}

