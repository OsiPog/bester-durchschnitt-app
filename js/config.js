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
    }
}