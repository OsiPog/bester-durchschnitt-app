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

        // Check lastly because it could return "STOP"
        // assigned not compared
        if (params = parameters["debug"]) {
            if (params.includes("style")) {
                const sample_subject = document.querySelector("#sample-subject-1");
                sample_subject.removeAttribute("hidden");
                const div_overall_average = document.querySelector("#overall-average");
                div_overall_average.removeAttribute("hidden");
                return "STOP";
            }
        }
    },

    removeParameters: (...parameters) => {
        // That the actual href has to be updated only once in this process.
        let new_href = window.location.href;

        // Going through every parameter in the given array and removing it.
        for(const parameter of parameters) {
            const regex = new RegExp(`(\\?|&)${parameter}=.+?(?=(&|$))`);
            new_href = new_href.replace(regex, "");
        }

        // Giving the first parameter thats left a leading "?".
        const left_parameters = new_href.match(/(\?|&).+?=.+?(?=(&|$))/g);
        if (left_parameters) {
            let first_param = left_parameters[0];

            new_href.replace(first_param, 
                `?${first_param.slice(1,first_param.length)}`);
        }

        // Updating the href
        // Making sure to only update if it's not the same
        if(new_href !== window.location.href) {
            // Basically `window.location.href = new_href` but without
            // reloading of the page (reloading causes problems on Safari)
            const root = document.querySelector(":root");
            window.history.pushState({
                "html": root.innerHTML,
                "pageTitle": document.title,
            },"", new_href);
        }
    }
}