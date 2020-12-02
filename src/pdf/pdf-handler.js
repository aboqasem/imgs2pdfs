'use strict';

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, PageSizes } = require('pdf-lib');

const { filterText, wrapText } = require('../utils');

/**
 * @param {String} containerPath Absolute path to container where PDFs will be saved.
 * @param {PdfData} pdfData PDF data for PDF files creation.
 * @param {Object} [options] Options, width and height default to landscape A4.
 * @param {Number} [options.pageWidth=PageSizes.A4[1]] PDF pages width.
 * @param {Number} [options.pageHeight=PageSizes.A4[0]] PDF pages height.
 * @returns {Promise<Boolean>} True if created, otherwise false.
 */
async function createPdfs(containerPath, pdfData, options = {
    pageWidth: PageSizes.A4[1],
    pageHeight: PageSizes.A4[0],
}) {
    const pageWidth = options.pageWidth || PageSizes.A4[1],
        pageHeight = options.pageHeight || PageSizes.A4[0];
    console.log(pdfData);
    // validate args
    if (!(containerPath && path.isAbsolute(containerPath) && pdfData && pageWidth > 0 && pageHeight > 0)) {
        console.error('Error: Invalid arguments.\n');
        return false;
    }
    if (!(pdfData.length)) {
        console.error('Error: No data to create PDF files from.\n');
        return false;
    }

    console.log(`Creating PDF files into: "${containerPath}"...\n`);
    let numPdf = 0;

    for (const { pdfName, imgFilesPaths, imgFilesTexts } of pdfData) {
        const pdfPath = path.format({
            dir: containerPath,
            name: pdfName,
            ext: '.pdf'
        });

        const pdfFileName = path.parse(pdfPath).base;

        console.log(`Creating "${pdfFileName}"...\n`);
        const pdfDocument = await PDFDocument.create();
        const pdfFont = await pdfDocument.embedFont(StandardFonts.TimesRoman);
        let index = 0, pageNumber = 1;
        for (const imgFilePath of imgFilesPaths) {
            console.log(`Creating page ${pageNumber} of ${pdfFileName}...\n`);
            // validate image file's type
            const imgFileType = path.extname(imgFilePath);
            if (!(imgFileType === '.jpg' || imgFileType === '.jpeg' || imgFileType === '.png')) {
                console.error(`Error: Invalid image type ${imgFileType} of file "${imgFilePath}".\n`);
                index++;
                continue;
            }
            // will create a page only if there is a valid image
            const page = pdfDocument.addPage([pageWidth, pageHeight]);
            let pageImage;
            if (imgFileType === '.png') {
                pageImage = await pdfDocument.embedPng(fs.readFileSync(imgFilePath));
            } else {
                pageImage = await pdfDocument.embedJpg(fs.readFileSync(imgFilePath));
            }
            page.drawImage(pageImage, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight,
            });

            // clean and wrap text
            const imgText = imgFilesTexts[index++];
            const cleanText = filterText(imgText, pdfFont.getCharacterSet());
            const drawableText = wrapText(cleanText, 140);
            page.drawText(drawableText, {
                x: 0,
                // to get the full text inside the page, since if 0 it will go out of bound
                y: pageHeight - 10,
                size: 12,
                opacity: 0,
            });
            console.log(`Added page ${pageNumber++} of ${pdfFileName}.\n`);
        }
        // check if there are pages created to save
        if (pdfDocument.getPageCount() > 0) {
            console.log(`Created "${pdfFileName}", saving...\n`);
            fs.writeFileSync(pdfPath, await pdfDocument.save());
            numPdf++;
            console.log(`Saved "${pdfFileName}" to "${pdfPath}".\n`);
        } else {
            console.error(`Error: Did not create "${pdfFileName}".\n`);
        }
    }
    // check if PDF files where created
    if (numPdf > 0) {
        console.log(`Done ${numPdf} PDF file(s). Saved created file(s) to "${containerPath}".\n`);
        return true;
    }
    console.error(`Error: No created PDF files.\n`);
    return false;
}

module.exports = { createPdfs }
