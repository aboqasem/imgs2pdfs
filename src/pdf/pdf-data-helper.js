'use strict';

/**
 * PDF file name, image files' paths, and each image file's text.
 * @typedef {{pdfName: String, imgsData: {imgPath: String, imgText: String}[]}[]} PdfData
 */


/**s
 * @param {import('../ocr/ocr-handler').RecognitionResults} recognitionResults Recognition results to map PDF data from.
 * @returns {PdfData} Mapped PDF data from container recognition results, empty PdfData on invalid args.
 */
function fromRecognitionResults(recognitionResults) {
    //
    if (!(recognitionResults && recognitionResults.length && recognitionResults[0].imgFilesPaths.length)) {
        console.error('Error: No recognition results to recognize.\n');
        return [{ pdfName: '', imgsData: [{ imgPath: '', imgText: '' }] }].filter(v => v.imgsData[0].imgText === ' ');
    }
    // map the PDF data with the available valid recognition results
    return recognitionResults.map(({ dirName, imgFilesPaths, results }) => {
        const pdfName = dirName;

        // map the images data with the available data
        const imgsData = imgFilesPaths.map((imgFilePath, index) => {
            return {
                imgPath: imgFilePath,
                imgText: results[index].data.text,
            };
        });

        return {
            pdfName,
            imgsData,
        };
    });
}

module.exports = { fromRecognitionResults }
