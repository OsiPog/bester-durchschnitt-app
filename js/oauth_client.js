const OAuthClient = {
    id: "72",
    secret: "849tB6MlYewtmKMOanMOm5lAuwXS3Dg6qtrlCg2E",

    init: () => {
    },

    getAuthorizeLink: () => {

        return `https://beste.schule/oauth/authorize`
        + `?client_id=${OAuthClient.id}`
        + `&scope=` // Not yet supported by beste.schule
        + `&response_type=code` // Access code
        + `&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`
    }
}