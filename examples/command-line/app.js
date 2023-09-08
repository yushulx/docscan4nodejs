const docscan4nodejs = require("../../index.js")
const readline = require('readline');

let devices = [];
// let host = 'http://192.168.8.119:18622';
let host = 'http://127.0.0.1:18622';

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
            docscan4nodejs.getDevices(host).then((scanners) => {
                devices = [];
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
                            //XferCount: 1,
                            //PageSize: 1,
                            Resolution: 200,
                            IfFeederEnabled: false,
                            IfDuplexEnabled: false,
                        };

                        docscan4nodejs.scanDocument(host, parameters).then((jobId) => {
                            if (jobId !== '') {
                                console.log('job id: ' + jobId);
                                (async () => {
                                    let images = await docscan4nodejs.getImageFiles(host, jobId, './');
                                    for (let i = 0; i < images.length; i++) {
                                        console.log('Image ' + i + ': ' + images[i]);
                                    }
                                    await docscan4nodejs.deleteJob(jobId);
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