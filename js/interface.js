// Update the loaded GRADES of the student and the global variable containing
// the student id
const changeStudent = async(student_id) => {
    setLoading(true);
    SELECTED_STUDENT_ID = student_id;
    
    // Get all grades of the student
    const response = await requestJSON(
        `students/${student_id}?include=grades,subjects,intervals`);
    
    console.log(response);
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
    //                             weight,
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

        // The weight will always be 1
        type.weight = 1;

        type.grades = type.grades || Array();
        type.grades.push(grade);                                
    }
    setLoading(false);

    // Update the grade and average view with the newly created dict
    updateGrades();
}

const updateGrades = () => {

}