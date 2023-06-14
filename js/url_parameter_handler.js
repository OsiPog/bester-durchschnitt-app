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
        console.log(left_parameters)
        if (left_parameters) {
            let first_param = left_parameters[0];

            new_href = new_href.replace(first_param, 
                `?${first_param.slice(1,first_param.length)}`);
        }

        // Updating the href
        URLParameterHandler.updateHref(new_href)
    },

    setParameters: (parameters) => {
        let new_href = window.location.href
        if (Object.keys(URLParameterHandler.getAll()).length === 0) {
                new_href += (new_href.at(-1)==="/" ? "" : "/") + "?"
                for (const param in parameters) {
                    new_href += param + "=" + parameters[param] + "&"
                }
                new_href = new_href.slice(0, new_href.length-1)
        }
        else {
            for (const param in parameters) {
                const value = parameters[param]
                const match = new_href.match(new RegExp(`(?:\\?|&)${param}=.+?(?=\\?|&|$)`))
                if (match) {
                    new_href = new_href.replace(match, String(match).replace(String(match).split("=")[1], value))
                }
                else {
                    new_href += "&" + param + "=" + value
                }
            }
        }

        URLParameterHandler.updateHref(new_href)
    },

    updateHref: (href) => {
        // Making sure to only update if it's not the same
        if(href !== window.location.href) {
            // Basically `window.location.href = href` but without
            // reloading of the page (reloading causes problems on Safari)
            const root = document.querySelector(":root");
            window.history.pushState({
                "html": root.innerHTML,
                "pageTitle": document.title,
            },"", href);
        }
    }
}