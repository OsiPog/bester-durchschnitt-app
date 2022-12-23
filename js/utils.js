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