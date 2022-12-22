const getGrades = async() => {
    let response = await fetch(
        "https://beste.schule/api/students/40640?include=grades,subjects,intervals,finalgrades",
        {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        }
    );

    console.log(await response.json());
}

const init = async() => {
    await getAccessToken();
    // Redirect to the login page if there's no access token
    if (!ACCESS_TOKEN) {
        openLogin();
        return;
    }
    await getGrades();
    //await deleteToken();
}

init()