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


    check: async () => {
        const parameters = URLParameterHandler.getAll();
        let return_stop = false

        for (const param in parameters) {
            const values = parameters[param]
            // assigned not compared

            switch (param) {
                case "export":
                    if (!STUDENT) break
                    if (values.includes("derabirechner")) {
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
                            lk1: subjects[0]["identifier"],
                            lk2: subjects[0]["identifier"],
                            p3: subjects[0]["identifier"],
                            p4: subjects[0]["identifier"],
                            p5: subjects[0]["identifier"],
                            url: "/bundesland/Sachsen/Gymnasium%2FGemeinschaftsschule"
                        }

                        Settings.clear()
                        Settings.setTitle("Endnotenexport nach derabirechner.de")

                        Settings.addSetting("Schuljahr 11", years, (id) => selected.year11 = id)
                        Settings.addSetting("Schuljahr 12", years, (id) => selected.year12 = id)
                        Settings.addSetting("1. Leistungskurs", subjects, (id) => selected.lk1 = id)
                        Settings.addSetting("2. Leistungskurs", subjects, (id) => selected.lk2 = id)
                        Settings.addSetting("3. Prüfungfach", subjects, (id) => selected.p3 = id)
                        Settings.addSetting("4. Prüfungfach", subjects, (id) => selected.p4 = id)
                        Settings.addSetting("5. Prüfungfach", subjects, (id) => selected.p5 = id)
                        Settings.addSetting("Bundesland", states, (id) => {
                            switch (id) {
                                case "SN":
                                    selected.url = "/bundesland/Sachsen/Gymnasium%2FGemeinschaftsschule"
                            }
                        })

                        // click action on okay button
                        const button = document.querySelector("#settings-close")
                        button.addEventListener("click", async() => {
                            // Swap key and value for easier handling later
                            const selected_subjects = {}
                            selected_subjects[selected.lk1] = "lk1"
                            selected_subjects[selected.lk2] = "lk2"
                            selected_subjects[selected.p3] = "p3"
                            selected_subjects[selected.p4] = "p4"
                            selected_subjects[selected.p5] = "p5"

                            // Make the array that holds all averages
                            const averages = []

                            // Year 11
                            await changeYear(selected.year11)
                            await changeStudent(STUDENT.id)
                            let interval_ids = Object.keys(STUDENT["intervals"])

                            // 11/1
                            Settings.selected.interval_id = interval_ids[0]
                            averages.push(updateGrades())

                            // 11/2
                            Settings.selected.interval_id = interval_ids[1]
                            averages.push(updateGrades())

                            // Year 12
                            await changeYear(selected.year12)
                            await changeStudent(STUDENT.id)
                            interval_ids = Object.keys(STUDENT["intervals"])

                            // 12/1
                            Settings.selected.interval_id = interval_ids[0]
                            averages.push(updateGrades())

                            // 12/2
                            Settings.selected.interval_id = interval_ids[1]
                            averages.push(updateGrades())

                            console.log(averages)
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