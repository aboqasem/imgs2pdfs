/**
 * @param {String} text Original text.
 * @param {Number[]} characterSet Accepted character set.
 * @returns {String} Filtered string with only the accepted characters, empty string on invalid args.
 */
function filterText(text, characterSet) {
    if (!(text && characterSet && characterSet.length)) {
        return '';
    }

    return text;
}

/**
 * @param {String} text Original text.
 * @param {Number} lineLength Number of characters until wrap.
 * @returns {String} Wrapped string to th line length, empty string on invalid args.
 */
function wrapText(text, lineLength) {
    if (lineLength < 0) {
        return '';
    }

    return text;
}

module.exports = { filterText, wrapText };