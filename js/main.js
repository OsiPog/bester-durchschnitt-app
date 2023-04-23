// Globals
let STUDENT;
let CATEGORIES;

const init = async() => {
    // Load the config from localStorage
    Config.load();
    // Initialized
    OAuthClient.init();
    // Settings
    Settings.init()

    // Check the parameters for any action
    if (URLParameterHandler.check() === "STOP") return;

    setLoading(true);
    // Depending on the login status change these elements
    const a_login = document.querySelector("#login");
    const select_student = document.querySelector("#student-selection");
    const div_not_logged_in = document.querySelector("#not-logged-in-text");
    
    // Try to get the access token (from localStorage or from a request)
    await Authenticator.getToken();

    // Remove the access code from the URL
    URLParameterHandler.removeParameters("code", "state");

    // If the user isn't logged in just add a link to the login button
    if (!Authenticator.access_token) {
        setLoading(false);

        // show login button, hide user select and show the login text
        a_login.removeAttribute("hidden");
        div_not_logged_in.removeAttribute("hidden");

        a_login.setAttribute("href", OAuthClient.getAuthorizeLink())
        return;
    }

    // Get all students connected to the account and the current year
    const me = await getJSON("me");

    // put students to the student selector
    select_student.innerHTML = "";
    for(const student of me.students) {
        const option = document.createElement("option");
        // Student id as value and name as displayed text
        option.innerText = student.forename + " " + student.name;
        option.setAttribute("value", student.id)
        select_student.appendChild(option);
    }

    // Update the student on change of the selection
    select_student.addEventListener("change", async() => {
        await changeStudent(select_student.value);
    })

    // student selection is visible
    select_student.removeAttribute("hidden");

    Settings.selected.year_id = me.year.id

    // Buttons for settings
    const img_settings_btn = document.querySelector("#settings-btn");
    // Show the button
    img_settings_btn.removeAttribute("hidden")
    // open settings on click
    img_settings_btn.addEventListener("click", Settings.open);
    const btn_settings_close = document.querySelector("#settings-close");
    btn_settings_close.addEventListener("click", Settings.close)

    // Logout button
    const img_logout_btn = document.querySelector("#logout-btn");
    img_logout_btn.removeAttribute("hidden");
    img_logout_btn.addEventListener("click", () => {
        delete Config._config["access_token"];
        Config.save()
        window.location.reload(true)
        return false;
    })

    // Overall average div
    const div_overall_average = document.querySelector("#overall-average");
    div_overall_average.removeAttribute("hidden")

    // Load default student
    await changeStudent(select_student.value);

    // First time of updating the settings
    Settings.update()
}

init()