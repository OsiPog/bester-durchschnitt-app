const Settings = {
    selected: {
        //year_id,
        //interval_id,
        using_percent: true,
    },

    update: async() => {
        const div_entries = document.querySelector("#settings>.body>.entries");
        // Clear all entries
        div_entries.innerHTML = ""

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
            Config.save()

            updateGrades()
        })

        // using percents or not
        Settings.addSetting("Wichtungsart", [
            {
                "label": "Prozente",
                "identifier": true,
                "pre_selected": Settings.selected.using_percent
            },
            {
                "label": "Wichtungen",
                "identifier": false,
                "pre_selected": !Settings.selected.using_percent
            },
        ], (state) => {
            Settings.selected.using_percent = state
            // TODO: Logic for category weights translation to percent or weights

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
    }
}