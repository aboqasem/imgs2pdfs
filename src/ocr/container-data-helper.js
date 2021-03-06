'use strict';

/**
 * Detailed data about a container to use in recognition.
 * @typedef {{dirName: String, dirPath: String, imgFilesNames: String[]}[]} ContainerData
 */

const fs = require('fs');
const path = require('path');


/**
 * @param {String} mainContainerPath Absolute path to the main container.
 * @param {Object} [options] Options.
 * @param {String} [options.dirNameContains='Folder'] Should be present in each directory name.
 * @param {String} [options.imgFileNameContains='Image'] Should be present in each image file name.
 * @param {number} [options.imgType=0] Type of image (0: PNG, 1: JPG).
 * @returns {ContainerData} Array of directories' data ready for use in recognition, empty array on invalid args.
 */
function getContainerData(mainContainerPath, options = {
    dirNameContains: 'Folder',
    imgFileNameContains: 'Image',
    imgType: 0,
}) {
    const dirNameContains = options.dirNameContains || 'Folder',
        imgFileNameContains = options.imgFileNameContains || 'Image',
        imgType = options.imgType || 0;
    // validate args
    if (!(mainContainerPath && path.isAbsolute(mainContainerPath) && imgType >= 0 && imgType <= 1)) {
        console.error('Error: Invalid arguments.\n');
        return [{ dirName: '', dirPath: '', imgFilesNames: [] }].filter(v => v.imgFilesNames.length);
    }

    // get the directories' entries from the main container
    const dirsNames = fs.readdirSync(mainContainerPath, { withFileTypes: true })
        .filter(fileDirent => fileDirent.isDirectory())
        .filter(dirDirent => dirDirent.name.includes(dirNameContains))
        .map(dirDirent => dirDirent.name);

    // map the container data with the available valid data
    const containerData = dirsNames.map(dirName => {
        const dirPath = path.join(mainContainerPath, dirName);
        const imgFilesNames = fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(fileDirent => fileDirent.isFile() && fileDirent.name.includes(imgFileNameContains))
            .filter(imgFileDirent => {
                const extension = path.extname(imgFileDirent.name);
                if (imgType === 0) {
                    return extension === '.png';
                } else {
                    return extension === '.jpg' || extension === '.jpeg';
                }
            })
            .map(imgFileDirent => imgFileDirent.name);

        return {
            dirName,
            dirPath,
            imgFilesNames,
        };
    }).filter(({ imgFilesNames }) => imgFilesNames.length);

    containerData.forEach(({ dirPath, imgFilesNames }) => {
        console.log(`Found ${imgFilesNames.length} image files in "${dirPath}":`);
        console.table(imgFilesNames);
        console.log();
    });
    return containerData;
}

module.exports = { getContainerData };
