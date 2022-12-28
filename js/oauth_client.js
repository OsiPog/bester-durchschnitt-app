const OAuthClient = {
    id: "62",
    secret: "zIFgtlRobJw5mypgrYnFCp40CUWd8ueOF8LkpO3Q",

    init: () => {
        // Get an OAuth Client from the config, if none found use the 
        // predefined one.
        OAuthClient.setClient(
            Config.get("OAuthClient_id") || OAuthClient.id,
            Config.get("OAuthClient_secret") || OAuthClient.secret,
        )
    },

    setClient: (id, secret) => {
        OAuthClient.id = id;
        OAuthClient.secret = secret;
        
        Config.set("OAuthClient_id", id);
        Config.set("OAuthClient_secret", secret);
    },

    getAuthorizeLink: () => {

        return `https://beste.schule/oauth/authorize`
        + `?client_id=${OAuthClient.id}`
        + `&scope=` // Not yet supported by beste.schule
        + `&response_type=code` // Access code
        + `&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`
    }
}