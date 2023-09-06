const axios = require('axios');
const readline = require('readline');
const fs = require('fs');

let devices = [];
let host = 'http://127.0.0.1:18622';

async function getScanners() {
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

        for (let i = 0; i < response.data.length; i++) {

            // let deviceInfo = response.data[i]['device'];
            devices.push(response.data[i]);
            console.log('\nIndex: ' + i + ', Name: ' + response.data[i]['name']);
        }
        // console.log(deviceInfo);
        // let json =  JSON.parse(deviceInfo);
        // console.log(json['name']);
    }
    console.log('.............................................');
}

async function getImage(jobid, imagePath) {
    let url = host + '/DWTAPI/ScanJobs/' + jobid + '/NextDocument';
    console.log('image: ' + url);
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
        });
        
        if (response.status == 200) {
            const writer = fs.createWriteStream(imagePath);

            response.data.pipe(writer);
            console.log('Saved image to ' + imagePath + '\n');
            console.log('.............................................');
            writer.on('finish', () => {});
            writer.on('error', (err) => { console.log(err); });
        }
        else {
            console.log(response);
        }
        
    } catch (error) {
        console.error("Error downloading image:", error);
    }
}

async function acquireImage(index) {
    console.log('\nAcquire image from scanner: ' + index);
    let scanParams = {
        license: "LICENSE-KEY",
        device: devices[index]
    };

    console.log(devices[index]);

    scanParams.config = {
        IfShowUI: false,
        PixelType: 2,
        //XferCount: 9,
        //PageSize: 1,
        Resolution: 200,
        IfFeederEnabled: false,
        IfDuplexEnabled: false,
    };

    let url = host + '/DWTAPI/ScanJobs'
    console.log('Acquiring image...' + url);
    let response = await axios.post(url, scanParams)
        .catch(error => {
            console.log('Error: ' + error);
        });

    if (response.status == 201) {
        console.log('Acquire image successfully.');
        let imagePath = 'document.jpg';
        
        await getImage(response.data, imagePath);
    }
    else {
        console.log(response);
    }
}

const questions = `
Please select an operation:
1. Get scanners
2. Acquire an image by scanner index
3. Quit
`

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function askQuestion() {
    rl.question(questions, function (answer) {
        if (answer === '3') {
            rl.close();
        }
        else if (answer === '1') {
            getScanners().then(() => {
                askQuestion();
            });
        }
        else if (answer == '2') {
            if (devices.length == 0) {
                console.log('Please get scanners first!\n');
                console.log('.............................................');
                askQuestion();
                return;
            }

            rl.question('\nSelect an index (<= ' + (devices.length - 1) + '): ', function (index) {
                index = parseInt(index, 10);
                if (isNaN(index)) {
                    console.log("It is not a number.");
                    console.log('.............................................');
                    askQuestion();
                } else {
                    if (index < 0 || index >= devices.length) {
                        console.log("It is out of range.");
                        console.log('.............................................');
                        askQuestion();
                    } else {
                        acquireImage(index).then(() => {
                            askQuestion();
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