// Globals
let STUDENT;
let CATEGORIES;
let SELECTED_INTERVAL_ID;

let SERVER = window.location.href.match(
    /^https?:\/\/((localhost|\d+\.\d+\.\d+\.\d+):\d+|osipog\.github\.io\/bester-durchschnitt-app)/g,
)[0];

const init = async() => {
    // Check for style debug parameter
    if (window.location.href.match(/(\?|&)debug=(.+)?(style)/g)) {
        const sample_subject = document.querySelector("#sample-subject-1");
        sample_subject.removeAttribute("hidden");
        return;
    }

    setLoading(true);
    // Depending on the login status change these elements
    const a_login = document.querySelector("#login");
    const select_student = document.querySelector("#student-selection");
    const div_not_logged_in = document.querySelector("#not-logged-in-text");
    
    // Try to get the access token (from localStorage or from a request)
    await getToken();

    // If the user isn't logged in just add a link to the login button
    if (!ACCESS_TOKEN) {
        setLoading(false);

        // show login button, hide user select and show the login text
        a_login.removeAttribute("hidden");
        div_not_logged_in.removeAttribute("hidden");

        a_login.setAttribute("href", 
            `https://beste.schule/oauth/authorize?client_id=${CLIENT_ID}&scope=&response_type=code&state=j1zcofU74Bv2eHFroqrwM9Tx8DsVdnmIOvNxzPZs`)
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