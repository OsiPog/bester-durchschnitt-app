const changeYear = async(year_id) => {
    await postJSON("years/current", {"id": year_id});
    Settings.selected.year_id = year_id;
}


// Update the loaded GRADES of the student and the global variable containing
// the student id
const changeStudent = async(student_id) => {
    // For pre selection of categories
    const exam_strings = [
        "KL", "Klausur", "KA", "Kl", "Klassenarbeit", "Ka", "K"];

    setLoading(true);
    
    // Get all grades of the student
    const response = await getJSON(
        `students/${student_id}?include=grades,subjects,intervals`);
    
    // Convert the response into a usable dict
    // Dict Structure
    // {
    //     forename,
    //     name,
    //     gender,
    //     id,
    //     intervals: {
    //         interval_id: {
    //             name,
    //             subjects: {
    //                 local_id: {
    //                     name,
    //                     types: {
    //                         name: {
    //                             category_id,
    //                             grades: [
    //                                  name,
    //                                  value,
    //                                  given_at
    //                              ]
    //                         },
    //                         ...
    //                     ]
    //                 },
    //                 ...
    //             }
    //         },
    //         ...
    //     }
    // }

    // Copying certain attributes to the dict
    STUDENT = {
        "forename": response["forename"],
        "name": response["name"],
        "gender": response["gender"],
        "id": response["id"]
    };
    
    // Create all intervals and subjects
    STUDENT["intervals"] = new Object();
    for(const response_interval of response["intervals"]) {
        let interval = {
            "name": response_interval["name"],
            "subjects": {}
        };

        STUDENT["intervals"][response_interval["id"]] = interval;

        for (const response_subject of response["subjects"]) {
            let subject = {
                "name": response_subject["name"],
                "types": {}
            };

            interval["subjects"][response_subject["local_id"]] = subject
        }
    }

    // Add grades into the right interval and subject
    for (const response_grade of response["grades"]) {
        let grade = {
            "value": response_grade["value"],
            "given_at": response_grade["given_at"],
            "name": response_grade["collection"]["name"]
        };

        // Get the certain grade type dict inside the STUDENT dict
        let type = objectTree([
            "intervals",
            response_grade["collection"]["interval_id"],
            "subjects",
            response_grade["collection"]["subject"]["local_id"],
            "types",
            response_grade["collection"]["type"]
        ], STUDENT)

        if (!type["category_id"]) {
            // Pre selecting the category based on exam_strings
            type["category_id"] = exam_strings.includes(
                response_grade["collection"]["type"]) ? 0 : 1;
        }

        // Add the grade to the type (create a new array if there isn't one)
        type.grades = type.grades || new Array();
        type.grades.push(grade);
    }

    // Assigning Globals
    Settings.selected.interval_id = Config.get("interval");

    let config_interval_in_intervals = false;
    for (const interval of response["intervals"]) {
        if (Number(Settings.selected.interval_id) === Number(interval.id)) 
            config_interval_in_intervals = true
    }
    if (!config_interval_in_intervals)
        Settings.selected.interval_id = response["intervals"][0].id

    // Adding default categories
    CATEGORIES = new Object();
    for (const response_subject of response["subjects"]) {
        CATEGORIES[response_subject.local_id] = [
            {
                id: 0,
                name: "KA/Klausur",
                weight: 50,
            },
            {
                id: 1,
                name: "Sonstige",
                weight: 50,
            }
        ]
    }

    // Apply any patches from config
    for(const key in Config._config) {
        if(key.match(/^patch\//g)) {
            const patch = Config.formatPatch(key)

            if ((Number(patch.year_id) !== Number(Settings.selected.year_id)) 
                || (Number(student_id) !== Number(STUDENT["id"]))) continue;

            const interval_config = STUDENT["intervals"][patch.interval_id];
            if (!interval_config) continue // shouldn't happen but who knows ¯\_(ツ)_/¯
            
            // Different logic for each different patch type
            switch(patch.type) {
                case "grade_type":
                    let to_be_patched = interval_config;
                    for (const segment of patch.route.slice(0,patch.route.length-1)) {
                        to_be_patched = to_be_patched[segment]
                    }
                    // If the patch is applied already (if the patch's value is the default
                    // value) the patch can be deleted from config
                    if (Number(to_be_patched[patch.route.at(-1)]) === Number(patch.value)) {
                        delete Config._config[key]
                    }
                    else {
                        to_be_patched[patch.route.at(-1)] = patch.value
                    }
                    break;
                case "category":
                    const [
                        local_id,
                        category_id,
                        attribute,
                    ] = patch.route

                    for (const category of CATEGORIES[local_id]) {
                        if (Number(category["id"]) === Number(category_id)) {
                            category[attribute] = Number(patch.value)
                            break
                        }
                    }
            }

            Config.save()
            
        }
    }

    setLoading(false);

    // Display the grades according to the dict
    updateGrades();
}


// Update the grade container
const updateGrades = () => {
    // The base container for all subject
    const root_div_grades = document.querySelector("#grades");

    // Clear the whole div
    root_div_grades.innerHTML = "";

    // Go through all subjects in the selected interval
    for(const local_id in 
            STUDENT["intervals"][Settings.selected.interval_id]["subjects"]) {

        const subject = 
            STUDENT["intervals"][Settings.selected.interval_id]["subjects"][local_id];
        
        // Subject container
        const div_subject = htmlElement("div", { 
            class_name: "subject", 
            parent: root_div_grades
        })

        // Title of the subject
        const h2_subject = htmlElement("h2", {parent: div_subject})
        
        const span_subject_title = htmlElement("span", {
            class_name: "title",
            parent: h2_subject,
            text: subject["name"]
        })

        // Display the local_id if subject name is too long
        if (subject["name"].length > 16) {
            span_subject_title.innerText = local_id;
        }
        
        // Body of the subject for categories and types
        const div_subject_body = htmlElement("div", {
            class_name: "body",
            parent: div_subject,
        })
        
        // No types in subject means that there are no marks either
        if (Object.keys(subject["types"]).length === 0) {
            htmlElement("p", {parent: div_subject_body, text: "Keine Noten"})
            if (Settings.selected.hide_gradeless)
                div_subject.parentElement.removeChild(div_subject)
            continue; // Skip to the next subject
        }

        // To keep track of the sum and count of all marks and its weight of a 
        // certain category
        let c_sum_count_weight = new Object();

        // Warnings will be displayed below the subject
        let warnings = []

        // Needed later for type control
        let category_ids = new Array();

        for(const category of CATEGORIES[local_id]) {

            const saveChange = () => {
                Config.patch("category", `${local_id}/${category["id"]}/weight`, category.weight)
                Config.save()
            }

            // Category container
            htmlElement("div", {
                class_name: "category",
                parent: div_subject_body,
                // Every category div has to be able to be found later
                attributes: {"c-id": String(category["id"])},
                children: [
                    // Title
                    htmlElement("h3", {text: category["name"]}),
                    // Container of types
                    htmlElement("div", {class_name: "types"}),
                    // Weight control
                    htmlElement("div", {
                        class_name: "weight-control",
                        children: [
                            htmlElement("img", {
                                class_name: "icon-btn",
                                attributes: {
                                    "src": "img/increment.svg",
                                },
                                event_listeners: {
                                    "click": () => {
                                        category.weight += 10**(Settings.selected.using_percent)
                                        category.weight = clamp(0,category.weight,99)
                                        if (Settings.selected.using_percent && (category.weight === 11)) {
                                            category.weight = 10;
                                        }
                                        saveChange()
                                        updateGrades()
                                    }
                                }
                            }),
                            htmlElement("input", {
                                attributes: {
                                    "value": String(category.weight),
                                    "maxlength": 2,
                                },
                                event_listeners: {
                                    "change": (el) => {
                                        if (String(Number(el.value)) !== "NaN") {
                                            category.weight = clamp(0,Number(el.value),99)
                                        }
                                        else if (el.value === "") {
                                            category.weight = 0
                                        }
                                        else {
                                            el.value = category.weight
                                            return
                                        }
                                        saveChange()
                                        updateGrades()
                                    }
                                }
                            }),
                            htmlElement("img", {
                                class_name: "icon-btn",
                                attributes: {
                                    "src": "img/decrement.svg",
                                },
                                event_listeners: {
                                    "click": () => {
                                        category.weight -= 10**(Settings.selected.using_percent)
                                        category.weight = clamp(0,category.weight,99)
                                        if ((category.weight === 0) && Settings.selected.using_percent) 
                                            category.weight = 1
                                        if (Settings.selected.using_percent && (category.weight === 89)) {
                                            category.weight = 90;
                                        }
                                        saveChange()
                                        updateGrades()
                                    }
                                }
                            }),
                            htmlElement("span", {
                                text: "(%)",
                                attributes: {
                                    "hidden": !Settings.selected.using_percent
                                }
                            })
                        ]
                    })
                ]
            })

            // for type control
            category_ids.push(category["id"]);

            // For later average calculation
            c_sum_count_weight[category["id"]] = {
                sum: 0,
                count: 0,
                weight: category["weight"]
            };
        }

        for(const type_name in subject["types"]) {
            const type = subject["types"][type_name];

            // The container containing the grades of this grade type
            const div_grade_type = htmlElement("div", {
                class_name: "grade-type",
                // Adding this grade type container to the type container with
                // The right c-id
                parent: div_subject_body.querySelector(
                    `div.category[c-id="${type.category_id}"]>div.types`),
                
                children: [
                    // The title of the grade type
                    htmlElement("h4", {text: type_name}),
                ]
            })

            // Container for the grades
            const div_grades = htmlElement("div", {
                class_name: "grades",
                parent: div_grade_type
            })

            // Adding all the grades into the grade container
            for(const grade of type["grades"]) {
                // The span containing the grade
                htmlElement("span", {
                    class_name: "grade",
                    parent: div_grades,
                    text: grade["value"],
                })

                // For average calculation
                c_sum_count_weight[type["category_id"]]["sum"] += 
                    parseInt(grade["value"]);
                c_sum_count_weight[type["category_id"]]["count"]++;
            }

            // Adding the type category control
            // (but only if there's more than one category)
            if (category_ids.length > 1) {
                const div_type_control = htmlElement("div", {
                    parent: div_grade_type,
                    class_name: "type-control"
                })

                // Find the position of the type in the categories
                // 0                        - on the left
                // category_ids.length-1    - on the right
                const index = category_ids.indexOf(Number(type["category_id"]));

                const createArrowButton = (x_direction) => {
                    const arrow = htmlElement("img", {
                        parent: div_type_control,
                        class_name: "icon-btn",
                        attributes: {
                            "src": "img/arrow.svg",
                        }
                    })

                    // Mirror arrow svg
                    if (x_direction === -1) 
                        arrow.setAttribute("style", "transform: scaleX(-1)");
                    
                    // Change the category of the type and update the page
                    arrow.addEventListener("click", async() => {
                        type["category_id"] = category_ids[index + x_direction];
                        // Save this change in the config
                        Config.patch("grade_type",
                            `subjects/${local_id}/types/${type_name}/category_id`, 
                            type["category_id"])

                        await suggestElementMovement(
                            div_grade_type, 0.5, [x_direction,0])
                        updateGrades();
                    })
                }

                // That means there's a category "left" from the category the
                // type is in.
                if (index > 0)
                    createArrowButton(-1);

                // That means there's a category "right" from the category the
                // type is in.
                if (index < category_ids.length - 1) {
                    createArrowButton(1);
                }
            } 
        }

        // Calculate the average
        let average = 0;
        let weights_sum = 0;
        let ignore_weighting = false

        for(const category_id in c_sum_count_weight) {
            const weight = c_sum_count_weight[category_id]["weight"];
            const sum = c_sum_count_weight[category_id]["sum"];
            const count = c_sum_count_weight[category_id]["count"];
            if (local_id === "SPO") console.log(weight, sum, count)

            // Delete any category which has a count of none, thus no grades.
            if (count === 0) {
                const div_category = div_subject_body.querySelector(
                    `div.category[c-id="${category_id}"]`);
                // Remove the div
                div_category.parentElement.removeChild(div_category);
                
                // If only one category is left, remove the weight control
                const divs_category = div_subject_body.querySelectorAll("div.category")
                if (divs_category.length == 1) {
                    ignore_weighting = true
                    const div_weight_control = divs_category[0].querySelector(".weight-control")
                    div_weight_control.parentElement.removeChild(div_weight_control)
                }
            }
            else {
                average += weight * (sum/count);
                weights_sum += weight;
            }

            if (weight === 0) {
                warnings.push({type: "warning", text: "Manchen Kategorien ist die Wichtung 0 zugeordnet."})
            }
        }

        // Divide all by the sum of all weights
        average /= weights_sum;
        
        average_text = average.toFixed(2)
        if (average_text === "NaN") average_text = "Fehler"

        if ((Settings.selected.using_percent) && (weights_sum !== 100) && !ignore_weighting) {
            average_text = "Fehler"
            warnings.push({type: "error", text: "Die Wichtungen ergeben zusammen nicht 100%!"})
        }

        // Create a span element inside the subject heading
        htmlElement("span", {
            class_name: "average",
            parent: h2_subject,
            text: `∅ ${average_text}`
        })

        // Display warnings
        const div_alerts = htmlElement("div", {
            parent: div_subject,
            class_name: "alerts"
        })

        for (const warning of warnings) {
            htmlElement("div", {
                parent: div_alerts,
                class_name: warning.type,
                text: warning.text
            })
        }
    }
}