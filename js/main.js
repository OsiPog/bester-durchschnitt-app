// Globals
let ACCOUNT;
let SELECTED_STUDENT_ID;
let SELECTED_INTERVAL_ID;

const toggleLoading = () => {
    const img_spinner = document.querySelector("#spinner");
    img_spinner.toggleAttribute("hidden");
}

const init = async() => {
    toggleLoading();
    // Depending on the login status change these elements
    const a_login = document.querySelector("#login");
    const select_user = document.querySelector("#student-selection");
    const div_not_logged_in = document.querySelector("#not-logged-in-text");
    
    // Try to get the access token (from localStorage or from a request)
    await getToken();

    // Remove the access code from the URL
    if (code = window.location.href.match(/(\?|&)code=.+?state=.+?($|&)/g)) {
        window.location.href = window.location.href.replace(code, "")
    }

    // If the user isn't logged in just add a link to the login button
    if (!ACCESS_TOKEN) {
        toggleLoading();

        // show login button, hide user select and show the login text
        a_login.removeAttribute("hidden");
        div_not_logged_in.removeAttribute("hidden");

        a_login.setAttribute("href", `https://beste.schule/oauth/authorize?client_id=${CLIENT_ID}&scope=&response_type=code&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`)
        return;
    }

    // hide login button, show user select and hide the login text
    select_user.removeAttribute("hidden");
    
    // Get the account which just logged in
    ACCOUNT = await requestJSON("me");
    console.log(ACCOUNT);

    // Set default values to the global variables
    SELECTED_STUDENT_ID = ACCOUNT["students"][0].id
    SELECTED_INTERVAL_ID = ACCOUNT["year"]["intervals"][0].id

    // Update the student selector
    select_user.innerHTML = "";
    for(const student of ACCOUNT["students"]) {
        const option = document.createElement("option");
        option.innerText = student.forename + " " + student.name;
        option.setAttribute("value", student.id)

        if (student.id === SELECTED_STUDENT_ID) 
            option.toggleAttribute("selected")

        select_user.appendChild(option);
    }

    // Add an event listener
    select_user.addEventListener("change", () => {
        let selected = select_user.querySelector("option[selected]");
        SELECTED_STUDENT_ID = selected.getAttribute("value");
    })

}

init()