const Settings = {
    selected: {
    },

    init: () => {
        Settings.selected = {
            year_id: -1, // set/get later
            interval_id: -1, // set/get later
            using_percent: (val = Config.get("using_percent"))? (val === "true") : true,
            hide_gradeless: (val = Config.get("hide_gradeless"))? (val === "true") : false, 
        }
    },

    update: async() => {
        Settings.clear()
        Settings.setTitle("Einstellungen")

        // years
        let options = Array();
        for (const year of await getJSON("years")) {
            options.push({
                "label": year.name,
                "identifier": year.id,
                "pre_selected": (Number(Settings.selected.year_id) === Number(year.id))
            })
        }

        Settings.addSetting("Schuljahr", options, async(year_id) => {
            const div_set_body = document.querySelector("#settings>.body");
            div_set_body.setAttribute("hidden", "")

            // Updating the year on the server
            await changeYear(year_id)

            // Update the page
            await changeStudent(STUDENT.id)

            // Update the settings (There will be different intervals now)
            await Settings.update()

            div_set_body.removeAttribute("hidden")
        })

        // intervals
        options = Array()
        for (const interval_id in STUDENT.intervals) {
            options.push({
                "label": STUDENT.intervals[interval_id].name,
                "identifier": interval_id,
                "pre_selected": 
                    (Number(interval_id) === Number(Settings.selected.interval_id))
            })
        }
        Settings.addSetting("Halbjahr", options, (interval_id) => {
            // Update the global variable
            Settings.selected.interval_id = interval_id;
            Config.set("interval", Settings.selected.interval_id)

            updateGrades()
        })

        // using percents or not
        Settings.addSetting("Wichtungsart", [
            {
                "label": "Prozente",
                "identifier": "percent",
                "pre_selected": Settings.selected.using_percent
            },
            {
                "label": "Wichtungen",
                "identifier": "weights",
                "pre_selected": !Settings.selected.using_percent
            },
        ], (state) => {
            Settings.selected.using_percent = (state === "percent")
            Config.set("using_percent", Settings.selected.using_percent)

            // Conversion from weights to percent or vice versa
            for (const local_id in CATEGORIES) {
                // Get the sum
                let sum = 0
                for (const category of CATEGORIES[local_id]) {
                    sum += Number(category.weight)
                }

                // for conversion percent-weights
                let i = 2
                let all_integers;

                do {
                    all_integers = true
                    // Convert
                    for (const category of CATEGORIES[local_id]) {
                        if (i === 2) {
                            category.weight = (Number(category.weight)/sum)
                        }

                        // weights to percent
                        if (Settings.selected.using_percent) {
                            category.weight = Math.round(category.weight*100)
                        }
                        // percent to weights
                        else {
                            // Multiply all weights by the same integer until they're all integers
                            category.weight *=  i
                            if ((Math.abs(category.weight - Math.round(category.weight)) < 0.05)
                                || (i === 100)) {
                                category.weight = Math.round(category.weight)
                            }
                            else {
                                category.weight /= i
                                all_integers = false
                            }
                        }
                    }
                    i++;
                    if (i === 100) break
                } while(!all_integers)

            }

            updateGrades()
        })

        // hide subjects with no grades
        Settings.addSetting("Fächer ohne Noten", [
            {
                "label": "ausblenden",
                "identifier": "hide",
                "pre_selected": Settings.selected.hide_gradeless
            },
            {
                "label": "anzeigen",
                "identifier": "show",
                "pre_selected": !Settings.selected.hide_gradeless
            },
        ], (state) => {
            Settings.selected.hide_gradeless = (state === "hide")
            Config.set("hide_gradeless", Settings.selected.hide_gradeless)

            updateGrades()
        })
    },

    open: () => {
        // Make the whole container visible
        const div_settings = document.querySelector("#settings");
        div_settings.removeAttribute("hidden");

        // To prepare for fading in
        div_settings.setAttribute("style", "opacity:0");

        // Short moment for animation
        setTimeout(() => {
            div_settings.removeAttribute("style");
        },10)
    },

    close: () => {
        const div_settings = document.querySelector("#settings");

        // Fading out
        div_settings.setAttribute("style", "opacity:0");

        // Save settings
        Config.save()

        // Short moment for animation
        setTimeout(() => {
            div_settings.removeAttribute("style");
            div_settings.setAttribute("hidden", "");
        },100)
    },

    addSetting: (
        label = null,
        options = null, // Array of Objects {label, identifier, pre_selected}
        handler = null // Will be executed on change: handler(option.identifier)
    ) => {
        const div_entries = document.querySelector("#settings>.body>.entries");
        
        // Label
        htmlElement("h2", {text: label, parent: div_entries})

        const select = htmlElement("select", {parent: div_entries})
        
        for(const option of options) {
            const elem = htmlElement("option", {
                attributes: {"value": option.identifier},
                text: option.label,
                parent: select
            })
            if (option.pre_selected) {
                elem.setAttribute("selected", "")
            }
        }

        // fire the handler once a different option was selected
        select.addEventListener("change", () => {handler(select.value)})
    },

    clear: () => {
        const div_entries = document.querySelector("#settings>.body>.entries");
        // Clear all entries
        div_entries.innerHTML = ""
    },

    setTitle: (title) => {
        const h1_settings = document.querySelector("#settings>.body>h1")
        h1_settings.innerText = title
    },
}