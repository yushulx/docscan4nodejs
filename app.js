const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

let devices = [];
// let host = 'http://192.168.8.119:18622';
let host = 'http://127.0.0.1:18622';

// Get available scanners
async function getDevices() {
    devices = [];
    // Device type: https://www.dynamsoft.com/web-twain/docs/info/api/Dynamsoft_Enum.html
    // http://127.0.0.1:18622/DWTAPI/Scanners?type=64
    let url = host + '/DWTAPI/Scanners'
    let response = await axios.get(url)
        .catch(error => {
            console.log(error);
        });

    console.log('\nAvailable scanners: ' + response.data.length);
    if (response.status == 200 && response.data.length > 0) {
        return response.data;
    }
    return [];
}

// Get document images by job id
async function getImages(jobId, directory) {
    let images = [];
    let url = host + '/DWTAPI/ScanJobs/' + jobId + '/NextDocument';
    console.log('Start downloading images......' );
    while(true) {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });
    
            if (response.status == 200) {
                await new Promise((resolve, reject) => {
                    const timestamp = Date.now();
                    const imagePath = path.join(directory, `image_${timestamp}.jpg`);
                    const writer = fs.createWriteStream(imagePath);
                    response.data.pipe(writer);
    
                    writer.on('finish', () => {
                        images.push(imagePath);
                        console.log('Saved image to ' + imagePath + '\n');
                        resolve();
                    });
    
                    writer.on('error', (err) => {
                        console.log(err);
                        reject(err);
                    });
                });
            }
            else {
                console.log(response);
            }
    
        } catch (error) {
            // console.error("Error downloading image:", error);
            console.error('No more images.');
            break;
        }
    }
    
    return images;
}

// Delete a scan job by job id
async function deleteJob(jobId) {

    if (!jobId) return;

    let url = host + '/DWTAPI/ScanJobs/' + jobId;
    console.log('Delete job: ' + url);
    axios({
        method: 'DELETE',
        url: url
    })
        .then(response => {
            console.log('Deleted:', response.data);
        })
        .catch(error => {
            // console.log('Error:', error);
        });
}

// Create a scan job by feeding one or multiple physical documents
async function scanDocument(parameters) {
    let url = host + '/DWTAPI/ScanJobs'
    let response = await axios.post(url, parameters)
        .catch(error => {
            console.log('Error: ' + error);
        });

    let jobId = response.data;

    if (response.status == 201) {
        return jobId;
    }
    else {
        console.log(response);
    }

    return '';
}

const questions = `
Please select an operation:
1. Get scanners
2. Acquire documents by scanner index
3. Quit
`

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function askQuestion() {
    console.log('.............................................');
    rl.question(questions, function (answer) {
        if (answer === '3') {
            rl.close();
        }
        else if (answer === '1') {
            getDevices().then((scanners) => {
                for (let i = 0; i < scanners.length; i++) {
                    devices.push(scanners[i]);
                    console.log('\nIndex: ' + i + ', Name: ' + scanners[i]['name']);
                }
                askQuestion();
            });
        }
        else if (answer == '2') {
            if (devices.length == 0) {
                console.log('Please get scanners first!\n');
                askQuestion();
                return;
            }

            rl.question('\nSelect an index (<= ' + (devices.length - 1) + '): ', function (index) {
                index = parseInt(index, 10);
                if (isNaN(index)) {
                    console.log("It is not a number.");
                    askQuestion();
                } else {
                    if (index < 0 || index >= devices.length) {
                        console.log("It is out of range.");
                        
                        askQuestion();
                    } else {
                        let parameters = {
                            license: "LICENSE-KEY",
                            device: devices[index].device,
                        };

                        parameters.config = {
                            IfShowUI: false,
                            PixelType: 2,
                            //XferCount: 9,
                            //PageSize: 1,
                            Resolution: 200,
                            IfFeederEnabled: false,
                            IfDuplexEnabled: false,
                        };

                        scanDocument(parameters).then((jobId) => {
                            if (jobId !== '') {
                                console.log('job id: ' + jobId);
                                (async () => {
                                    let images = await getImages(jobId, './');
                                    for (let i = 0; i < images.length; i++) {
                                        console.log('Image ' + i + ': ' + images[i]);
                                    }
                                    await deleteJob(jobId);
                                    askQuestion();
                                })();
                            }

                        });
                    }
                }
            });
        }
        else {
            askQuestion();
        }

    });
}

askQuestion();