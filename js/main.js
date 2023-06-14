const checkURLParameters = async () => {
    const parameters = URLParameterHandler.getAll();
    let return_stop = false

    for (const param in parameters) {
        const values = parameters[param]

        switch (param) {
            case "export":
                // Remember this parameter even after reload
                Config.set("export", "derabirechner")

                if (!STUDENT) break
                if (values.includes("derabirechner")) {
                    // Remove memory of export param
                    Config.set("export", "")

                    // Hide grades
                    const div_grades = document.querySelector("#grades")
                    const div_overall_average = document.querySelector("#overall-average")

                    div_grades.setAttribute("style", "display:none !important")
                    div_overall_average.setAttribute("style", "display:none !important")

                    // get years
                    const years = Array();
                    for (const year of await getJSON("years")) {
                        years.push({
                            "label": year.name,
                            "identifier": year.id,
                        })
                    }
                    await changeYear(years.at(-1)["identifier"]) // Fix for the right subjects
                    await changeStudent(STUDENT.id)

                    // subjects
                    const subjects = Array()
                    for (const local_id in STUDENT["intervals"][Settings.selected.interval_id]["subjects"]) {
                        const subject = STUDENT["intervals"][Settings.selected.interval_id]["subjects"][local_id]
                        subjects.push({
                            "label": subject["name"].length < 16 ? subject["name"] : local_id,
                            "identifier": local_id,
                        })
                    }

                    // states
                    const states = [
                        {
                            "label": "Sachsen",
                            "id": "SN"
                        }
                    ]

                    // Setup selection menu
                    const selected = {
                        year11: years[0]["identifier"],
                        year12: years[0]["identifier"],
                        subjects: {
                            lk1: subjects[0]["identifier"],
                            lk2: subjects[0]["identifier"],
                            p3: subjects[0]["identifier"],
                            p4: subjects[0]["identifier"],
                            p5: subjects[0]["identifier"],
                        },
                        url: "/bundesland/Sachsen/Gymnasium%2FGemeinschaftsschule"
                    }

                    Settings.clear()
                    Settings.setTitle("Endnotenexport nach derabirechner.de")

                    Settings.addSetting("Schuljahr 11", years, (id) => selected.year11 = id)
                    Settings.addSetting("Schuljahr 12", years, (id) => selected.year12 = id)
                    Settings.addSetting("1. Leistungskurs", subjects, (id) => selected.subjects.lk1 = id)
                    Settings.addSetting("2. Leistungskurs", subjects, (id) => selected.subjects.lk2 = id)
                    Settings.addSetting("3. Prüfungfach", subjects, (id) => selected.subjects.p3 = id)
                    Settings.addSetting("4. Prüfungfach", subjects, (id) => selected.subjects.p4 = id)
                    Settings.addSetting("5. Prüfungfach", subjects, (id) => selected.subjects.p5 = id)
                    Settings.addSetting("Bundesland", states, (id) => {
                        switch (id) {
                            case "SN":
                                selected.url = "/bundesland/Sachsen/Gymnasium%2FGemeinschaftsschule"
                        }
                    })

                    // click action on okay button
                    const button = document.querySelector("#settings-close")
                    button.addEventListener("click", async() => {
                        // Make the array that holds all averages
                        const averages = []

                        // Year 11
                        await changeYear(selected.year11)
                        await changeStudent(STUDENT.id)
                        let interval_ids = Object.keys(STUDENT["intervals"])

                        // 11/1
                        Settings.selected.interval_id = interval_ids[0]
                        averages.push(updateGrades(true))

                        // 11/2
                        Settings.selected.interval_id = interval_ids[1]
                        averages.push(updateGrades(true))

                        // Year 12
                        await changeYear(selected.year12)
                        await changeStudent(STUDENT.id)
                        interval_ids = Object.keys(STUDENT["intervals"])

                        // 12/1
                        Settings.selected.interval_id = interval_ids[0]
                        averages.push(updateGrades(true))

                        // 12/2
                        Settings.selected.interval_id = interval_ids[1]
                        averages.push(updateGrades(true))

                        // redirect to derabirechner.de
                        window.location.href = "https://derabirechner.de" + selected.url + "?import=" + JSON.stringify([averages, selected.subjects]) 
                    })

                    Settings.open()
                }
                break

            case "debug":
                if (values.includes("style")) {
                    const sample_subject = document.querySelector("#sample-subject-1");
                    sample_subject.removeAttribute("hidden");
                    const div_overall_average = document.querySelector("#overall-average");
                    div_overall_average.removeAttribute("hidden");
                    return_stop = true
                }
        }
    }

    return return_stop ? "STOP" : null
}

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

    // We don't want to lose the export param after login of the user
    if (Config.get("export")) URLParameterHandler.setParameters({"export": Config.get("export")})

    // Check the parameters for any action
    if (await checkURLParameters() === "STOP") return;

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

    // Load default student
    await changeStudent(select_student.value);

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
        localStorage.clear()
        window.location.reload(true)
        return false;
    })

    // Overall average div
    const div_overall_average = document.querySelector("#overall-average");
    div_overall_average.removeAttribute("hidden")

    // First time of updating the settings
    Settings.update()

    // Check the parameters again for any post loading events
    await checkURLParameters()
}

init()