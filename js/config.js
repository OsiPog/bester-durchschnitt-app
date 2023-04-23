// A config handler on top of localStorage for additional encryption
const Config = {
    // A dict that holds the config to the app
    _config: {},
    // get the config from localStorage 
    load: () => {
        const decrypted = vigenere(
            localStorage.getItem("bester-durchschnitt-app"), 
            "bester-durchschnitt", true);
        
        if (decrypted) {
            for (const key_value of decrypted.split(",")) {
                let [key, value] = key_value.split("=");
                Config._config[key] = value;
            }
        }
    },

    save: () => {
        let decrypted = "";
        for(const key in Config._config) {
            decrypted += `${key}=${Config._config[key]},`;
        }

        // Remove the trailing comma
        decrypted = decrypted.slice(0, decrypted.length -1);
        
        localStorage.setItem("bester-durchschnitt-app",
            vigenere(decrypted, "bester-durchschnitt"));
    },

    get: (key) => {
        return Config._config[key];
    },

    set: (key, value) => {
        Config._config[key] = value;
        Config.save();
    },

    // Creates a patch 
    // "patch/{patch_type}/{student_id}/{year_id}/{interval_id}/{patch_route}"
    patch: (type, route, value) => {
        console.log(route, value)
        let key;
        // relative path
        if(route.at(0) !== "/") {
            key = `patch/${type}/${STUDENT.id}/${SELECTED_YEAR_ID}/${SELECTED_INTERVAL_ID}/${route}`
        }
        else key = `patch${route}`;

        Config.set(key, value);
    },

    formatPatch: (patch) => {
        const path = patch.split("/")

        if (path[0] !== "patch") throw "Passed string is not a patch"
        return {
            type: path[1],
            student_id: path[2],
            year_id: path[3],
            interval_id: path[4],
            route: path.slice(5,path.length),
            value: Config.get(patch)
        }
    }
}