// Update the loaded GRADES of the student and the global variable containing
// the student id
const changeStudent = async(student_id) => {
    // For pre selection of categories
    const EXAM_STRINGS = [
        "KL", "Klausur", "KA", "Kl", "Klassenarbeit", "Ka", "K"];

    setLoading(true);
    
    // Get all grades of the student
    const response = await requestJSON(
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
    STUDENT = Object();
    STUDENT["forename"] = response["forename"];
    STUDENT["name"] = response["name"];
    STUDENT["gender"] = response["gender"];
    STUDENT["id"] = response["id"];
    
    // Create all intervals and subjects
    STUDENT["intervals"] = Object();
    for(const response_interval of response["intervals"]) {
        let interval = Object();
        STUDENT["intervals"][response_interval["id"]] = interval;

        interval["name"] = response_interval["name"];
        interval["subjects"] = Object();

        for (const response_subject of response["subjects"]) {
            let subject = Object();
            interval["subjects"][response_subject["local_id"]] = subject

            subject["name"] = response_subject["name"];
            subject["types"] = Object();
        }
    }

    // Add grades into the right interval and subject
    for (const response_grade of response["grades"]) {
        let grade = Object();
        grade["value"] = response_grade["value"];
        grade["given_at"] = response_grade["given_at"];
        grade["name"] = response_grade["collection"]["name"];

        let type = objectTree([
            "intervals",
            response_grade["collection"]["interval_id"],
            "subjects",
            response_grade["collection"]["subject"]["local_id"],
            "types",
            response_grade["collection"]["type"]
        ], STUDENT)

        if (!type["category_id"]) {
            type["category_id"] = EXAM_STRINGS.includes(
                response_grade["collection"]["type"]) ? 0 : 1;
        }

        type.grades = type.grades || Array();
        type.grades.push(grade);
    }

    // Assigning Globals
    SELECTED_INTERVAL_ID = response["intervals"][0].id;

    // Adding default categories
    CATEGORIES = Object();
    for (const response_subject of response["subjects"]) {
        CATEGORIES[response_subject.local_id] = [
            {
                id: 0,
                name: "KA/Klausur",
                weight: 1,
            },
            {
                id: 1,
                name: "Sonstige",
                weight: 1,
            }
        ]
    }

    setLoading(false);

    // Display the grades according to the dict
    updateGrades();
}

const updateGrades = () => {
    // The base container for all subject
    const root_div_grades = document.querySelector("#grades");

    // Clear the whole div
    root_div_grades.innerHTML = "";

    // Go through all subjects in the selected interval
    for(const local_id in 
            STUDENT["intervals"][SELECTED_INTERVAL_ID]["subjects"]) {

        const subject = 
            STUDENT["intervals"][SELECTED_INTERVAL_ID]["subjects"][local_id];
        
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
            continue; // Skip to the next subject
        }

        // To keep track of the sum and count of all marks and its weight of a 
        // certain category
        let c_sum_count_weight = {};

        for(const category of CATEGORIES[local_id]) {
            // Category container
            htmlElement("div", {
                class_name: "category",
                parent: div_subject_body,
                // Every category div has to be able to be found later
                attributes: {"c-id": category["id"]},
                children: [
                    // Title
                    htmlElement("h3", {text: category["name"]}),
                    // Container of types
                    htmlElement("div", {class_name: "types"})
                ]
            })

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
                    Number(grade["value"]);
                c_sum_count_weight[type["category_id"]]["count"]++;
            }
            
        }

        // Calculate the average
        let average = 0;
        let weights_sum = 0;

        for(const category_id in c_sum_count_weight) {
            const weight = c_sum_count_weight[category_id]["weight"];
            const sum = c_sum_count_weight[category_id]["sum"];
            const count = c_sum_count_weight[category_id]["count"];

            // Delete any category which has a count of none, thus no grades.
            if (count === 0) {
                const div_category = div_subject_body.querySelector(
                    `div.category[c-id="${category_id}"]`);
                // Remove the div
                div_category.parentElement.removeChild(div_category);

                // Remove the entry from the Array
                for(let i=0;i<CATEGORIES.length;i++) {
                    if (category_id === CATEGORIES[i]["id"]) {
                        CATEGORIES.splice(i, 1); // remove the element
                        break;
                    }
                }

                continue; // Go to the next category
            }
            
            average += weight * (sum/count);

            weights_sum += weight;
        }

        // Divide all by the sum of all weights
        average /= weights_sum;

        // Create a span element inside the subject heading
        htmlElement("span", {
            class_name: "average",
            parent: h2_subject,
            text: `∅ ${average.toFixed(2)}`
        })
    }
}