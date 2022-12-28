const Authenticator = {
    access_token: null,

    getToken: async() => {
        // Checking if there's a token in localStorage
        // content is being assigned not compared
        if (token = Config.get("access_token")) {
            Authenticator.access_token = token;
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
            Config.set("access_token", Authenticator.access_token);
        }
    },

    // Deletes the access token from localStorage and reloads the page
    forgetToken: () => {
        Config.set("access_token", "");
        window.location.reload(true);
    },
}

