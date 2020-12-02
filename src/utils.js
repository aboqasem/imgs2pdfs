const { lineSplit } = require("pdf-lib");

/**
 * @param {String} text Original text.
 * @param {Number[]} characterSet Accepted character set.
 * @returns {String} Filtered string with only the accepted characters, empty string on invalid args.
 */
function filterText(text, characterSet) {
    if (!(text && characterSet && characterSet.length)) {
        return '';
    }

    let filteredText = '';
    for (let i = 0; i < text.length; i++) {
        if (characterSet.includes(text.charCodeAt(i))) {
            filteredText += text.charAt(i);
        }
    }
    return filteredText;
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

    const lines = [];
    let line = '';
    text.split(/\s+/).forEach((word, index, words) => {
        // accept new words
        line += `${word} `;
        // maybe 15 is good to prevent next words from getting out of wrapping bound
        if (line.length >= lineLength - 15) {
            lines.push(line.trimEnd());
            // empty the line when out of safe bound
            line = '';
        } else if (index == words.length - 1) {
            lines.push(line.trimEnd());
        }
    });

    return lines.join('\n');
}

module.exports = { filterText, wrapText };
