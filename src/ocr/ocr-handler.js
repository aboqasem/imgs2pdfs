'use strict';

/**
 * Results of recognition of each of the directories' image files.
 * @typedef {{dirName: String, imgFilesPaths: String[], results: Tesseract.RecognizeResult[]}[]} RecognitionResults
 */

const path = require('path');
const { createScheduler, createWorker } = require('tesseract.js');


// don't use all logical CPUs
const numLogicalCpusToUse = require('os').cpus().length - 1;

/**
 * @param {Number} [numJobs=numLogicalCpusToUse] Number of all jobs.
 * @returns {Promise<Tesseract.Scheduler>} Job scheduler for OCR.
 */
async function getNewScheduler(numJobs = numLogicalCpusToUse) {
    // validate args
    if (numJobs <= 0) {
        console.error('Error: No workers to spawn.\n');
        numJobs = 0;
    }
    const numWorkers = numJobs < numLogicalCpusToUse ? numJobs : numLogicalCpusToUse;

    const scheduler = createScheduler();
    for (let i = 0; i < numWorkers; ++i) {
        const worker = createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        scheduler.addWorker(worker);
    }
    return scheduler;
}

/**
 * @param {import('./container-data-helper').ContainerData} containerData
 * @returns {Number} Maximum number of image file names found in container's directories.
 */
function getMaxNumImages(containerData) {
    let maxNumImages = 0;
    containerData.forEach(dirData => {
        const numImageFiles = dirData.imgFilesNames.length;
        if (maxNumImages < numImageFiles)
            maxNumImages = dirData.imgFilesNames.length;
    });
    return maxNumImages;
}

/**
 * @param {import('./container-data-helper').ContainerData} containerData
 * @returns {Promise<RecognitionResults>} Promise of recognition results, promise of empty RecognitionResults on invalid args.
 */
async function recognize(containerData) {
    // validate args
    if (!(containerData && containerData.length)) {
        console.error('Error: No data to recognize.\n');
        return [{ dirName: '', imgFilesPaths: [], results: [] }].filter(v => v.imgFilesPaths.length);
    }

    const scheduler = await getNewScheduler(getMaxNumImages(containerData));

    const recognitionResults = [];

    for (const { dirName, dirPath, imgFilesNames } of containerData) {

        const imgFilesPaths = imgFilesNames.map(imgFileName =>
            path.join(dirPath, imgFileName)
        );

        const recognitionResult = {
            dirName,
            imgFilesPaths,
            // results will remain sorted
            results: await Promise.all(
                imgFilesNames.map((imgFileName, index) => {
                    const jobId = `Image File ${index + 1} @ ${dirName}`;
                    const job = scheduler.addJob('recognize',
                        imgFilesPaths[index],
                        {}, jobId,
                    );
                    job.then(() => {
                        console.log(`Recognized (${jobId}).\n`);
                    });

                    console.log(`Added "${imgFilesPaths[index]}" as (${jobId}) to the queue.\n`);
                    return job;
                })
            ),
        };
        recognitionResults.push(recognitionResult);
    }
    scheduler.terminate().then(() => {
        console.log('Terminated the scheduler.\n');
    });

    return recognitionResults;
}

module.exports = { recognize };
