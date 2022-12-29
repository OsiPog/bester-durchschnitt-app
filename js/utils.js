// Randomly shuffled alphabet with capital, lowerace and special characters
const LETTERS = "Q3EM>DWug+lA$CS&*m81jd!9V_cLK§Z4UO6y?0nferv<Xb2saxkPBGwoF5piY#JItNH7hq%-RzT"

function vigenere(string, key_string, decrypt = false) {
    if ((string === "") || (key_string === "") || !string || !key_string) return;

    // Going through the whole string
    let key, index;
    let new_string = "";
    for (let i = 0; i < string.length; i++) {
        key_char = key_string[i % key_string.length];
        // Skip if any character is not in the table
        if (!LETTERS.includes(string[i]) || !LETTERS.includes(key_char)) {
            new_string += string[i];
            continue;
        }

        // Getting the amount of shifting of the current char
        key = LETTERS.indexOf(key_char);
        if (decrypt) key *= -1;

        index = LETTERS.indexOf(string[i]) + key;
        if (index > LETTERS.length - 1) index -= LETTERS.length;
        if (index < 0) index += LETTERS.length;
        new_string += LETTERS[index];
    }

    return new_string;
}

// Sends a GET request to the server using the ACCESS_TOKEN to authenticate,
// that request is awaited and the result of the request is converted to a JSON
// this conversion is awaited too.
// Returns the answer to the request as JSON
const requestJSON = async(route) => {
    let response;
    try {
        response = await fetch(`https://beste.schule/api/${route}`, {
            headers: {
                Authorization: `Bearer ${Authenticator.access_token}`
            }
        });
    }
    // If the token got deleted from the server this request will throw and
    // error. To fix this get a new token.
    catch {
        // Deletes the token from localStorage and reloads
        Authenticator.forgetToken();
    }

    // Return only the data attribute because meta is irrelevant
    return (await response.json()).data
}

// Toggle visibility of loading spinner
const setLoading = (start_loading) => {
    const img_spinner = document.querySelector("#spinner");
    if (start_loading) {
        img_spinner.removeAttribute("hidden");
        img_spinner.setAttribute("style", "opacity:100%");
    }
    else {
        img_spinner.setAttribute("style", "opacity:0%");
        // Delay for adding the hidden attribute for the blend of the 
        // transition
        setTimeout(() => img_spinner.setAttribute("hidden", ""), 2000)
    }
}

// Creating Object tree (nested objects)
function objectTree(keys, object) {
    let level;
    let prev_level = object;
    for (let key of keys) {
        level = prev_level[key];
        if (!level) {
            level = new Object();
            prev_level[key] = level;
        }

        prev_level = level;
    }

    return level; // return the last level/layer of the tree
}


// Shortcut for creating an element with a class a parent and inner text
const htmlElement = ( tag, {
    class_name = null,
    parent = null,
    text = null,
    attributes = null,
    children = null,
    }) => {
    
    // Creating the base element
    const element = document.createElement(tag);

    // class, parent and innerText
    if (class_name)
        element.className = class_name;
    if (parent) 
        parent.appendChild(element);
    if (text)
       element.innerText = text;
    
    // attributes should be dict of attributes e.g {"id": "4", "src": "path/to"}
    if (attributes)
        for(const attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute]);
        }
    
    // children should be an array of elements
    if (children) {
        for (const child of children) {
            element.appendChild(child);
        }
    }

    return element
}