// Globals
let STUDENT;
let CATEGORIES;
let SELECTED_INTERVAL_ID;

const init = async() => {
    // Load the config from localStorage
    Config.load();
    // Initialized
    OAuthClient.init();

    // Check the parameters for any action
    if (URLParameterHandler.check() === "STOP") return;

    setLoading(true);
    // Depending on the login status change these elements
    const a_login = document.querySelector("#login");
    const select_student = document.querySelector("#student-selection");
    const div_not_logged_in = document.querySelector("#not-logged-in-text");
    
    // Try to get the access token (from localStorage or from a request)
    await Authenticator.getToken();

    // If the user isn't logged in just add a link to the login button
    if (!Authenticator.access_token) {
        setLoading(false);

        // show login button, hide user select and show the login text
        a_login.removeAttribute("hidden");
        div_not_logged_in.removeAttribute("hidden");

        a_login.setAttribute("href", OAuthClient.getAuthorizeLink())
        return;
    }

    // Get all students connected to the account
    const students = await requestJSON("students");

    // put students to the student selector
    select_student.innerHTML = "";
    for(const student of students) {
        const option = document.createElement("option");
        // Student id as value and name as displayed text
        option.innerText = student.forename + " " + student.name;
        option.setAttribute("value", student.id)
        select_student.appendChild(option);
    }

    // Update SELECTED_STUDENT_ID on change of the selection
    select_student.addEventListener("change", async() => {
        await changeStudent(select_student.value);
    })

    // student selection
    select_student.removeAttribute("hidden");

    // Load default student
    await changeStudent(select_student.value);
}

init()