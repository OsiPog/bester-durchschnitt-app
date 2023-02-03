const Settings = {

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
                "pre_selected": (Number(SELECTED_YEAR_ID) === Number(year.id))
            })
        }

        Settings.addSetting("Schuljahr", options, async(year_id) => {
            // For a nicer view for the user
            Settings.close()
            
            // Updating the year on the server
            await changeYear(year_id)

            // Update the page
            await changeStudent(STUDENT.id)

            // Update the settings (There will be different intervals now)
            await Settings.update()
            Settings.open()
        })

        // intervals
        options = Array()
        for (const interval_id in STUDENT.intervals) {
            options.push({
                "label": STUDENT.intervals[interval_id].name,
                "identifier": interval_id
            })
        }
        Settings.addSetting("Halbjahr", options, (interval_id) => {
            // Update the global variable
            SELECTED_INTERVAL_ID = interval_id;

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