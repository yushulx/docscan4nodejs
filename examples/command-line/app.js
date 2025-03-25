const docscan4nodejs = require("../../index.js")
const readline = require('readline');

let devices = [];
let host = 'http://127.0.0.1:18622';

docscan4nodejs.getServerInfo(host).then((info) => {
    console.log('Server info:', info);
});

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
            docscan4nodejs.getDevices(host, docscan4nodejs.ScannerType.TWAINSCANNER | docscan4nodejs.ScannerType.TWAINX64SCANNER).then((scanners) => {
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
                            license: "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==",
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

                        docscan4nodejs.scanDocument(host, parameters).then((job) => {
                            try {
                                let json = JSON.parse(job);
                                let jobid = json.jobuid;
                                (async () => {
                                    let images = await docscan4nodejs.getImageFiles(host, jobid, './');
                                    for (let i = 0; i < images.length; i++) {
                                        console.log('Image ' + i + ': ' + images[i]);
                                    }
                                    await docscan4nodejs.deleteJob(host, jobid);
                                    askQuestion();
                                })();
                            }
                            catch (error) {
                                console.error('Job creation failed:', error.message);
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