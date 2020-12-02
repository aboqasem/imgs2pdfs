/**
 * 
 * @param {String} text 
 * @param {Number[]} characterSet 
 */
function filterText(text, characterSet) {
    if (!(text && characterSet && characterSet.length)) {
        return '';
    }

    return text;
}

/**
 * 
 * @param {String} text 
 * @param {Number} lineLength 
 */
function wrapText(text, lineLength) {

    return text;
}

module.exports = { filterText, wrapText };