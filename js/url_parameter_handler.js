const URLParameterHandler = {

    // Returns a dict of all parameters in the URL
    getAll: () => {
        const matches = window.location.href.match(/(\?|&).+?=.+?(?=(&|$))/g);
        const parameters = new Object();

        if (matches) {
            for(const match of matches) {
                let [key, value] = match.split("=");

                // Remove the "?" or "&" at the start
                key = key.slice(1,key.length)

                // If a comma is in the value treat it as a list
                if (value.includes(",")) {
                    value = value.split(",")
                }
                parameters[key] = value;
            }
        }

        return parameters;
    },


    check: () => {
        const parameters = URLParameterHandler.getAll();

        if (parameters["oauth_client"]) {
            OAuthClient.id = parameters["oauth_client"][0];
            OAuthClient.secret =  parameters["oauth_client"][1];
        }

        // Check lastly because it could return "STOP"
        if (params = parameters["debug"]) {
            if (params.includes("style")) {
                const sample_subject = document.querySelector("#sample-subject-1");
                sample_subject.removeAttribute("hidden");
                return "STOP";
            }
        }
    }
}