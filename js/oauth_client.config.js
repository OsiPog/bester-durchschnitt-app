let CLIENT_ID;
let CLIENT_SECRET;

// Use a differently configured app when testing the app locally
if (window.location.href.match(/^http:\/\/localhost:/g)) {
    CLIENT_ID = "59";
    CLIENT_SECRET = "u6Cc5niB2TebFYgMA9peSbbmcg6uBQ0U6iPJC5jy";
}
else if (window.location.href.match(/^http:\/\/\d+\.\d+\.\d+\.\d+:/g)) {
    CLIENT_ID = "60";
    CLIENT_SECRET = "ZGf1gnUv7JgmUPfsgxQA6pvP5YW47vANtxtYJbHB";
}
else {
    CLIENT_ID = "58";
    CLIENT_SECRET = "pemoySGLPS3ruxizFNi7qEgP9rsEiV8WbFWzqRLY";
}