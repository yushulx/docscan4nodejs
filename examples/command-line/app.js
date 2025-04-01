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
                            autoRun: true
                        };

                        parameters.config = {
                            IfShowUI: false,
                            PixelType: 2,
                            //XferCount: 1,
                            //PageSize: 1,
                            Resolution: 200,
                            IfFeederEnabled: true,
                            IfDuplexEnabled: false,
                        };

                        docscan4nodejs.createJob(host, parameters).then((job) => {
                            try {
                                let jobId = job.jobuid;

                                (async () => {
                                    // let status = await docscan4nodejs.checkJob(host, jobId);
                                    // console.log('Job status:', status);

                                    // let caps = await docscan4nodejs.getScannerCapabilities(host, jobId);
                                    // console.log('Capabilities:', caps);

                                    // let updateStatus = await docscan4nodejs.updateJob(host, jobId, {
                                    //     status: docscan4nodejs.JobStatus.RUNNING
                                    // });
                                    // console.log('Update status:', updateStatus);
                                    let doc = await docscan4nodejs.createDocument(host, {});
                                    // console.log('Document:', doc);


                                    let images = await docscan4nodejs.getImageFiles(host, jobId, './');
                                    for (let i = 0; i < images.length; i++) {
                                        console.log('Image ' + i + ': ' + images[i]);
                                        let info = await docscan4nodejs.getImageInfo(host, jobId);
                                        // console.log('Image info:', info);

                                        let insertPage = await docscan4nodejs.insertPage(host, doc.uid, { password: '', source: info.url });
                                        // console.log('Insert page:', insertPage);
                                    }


                                    let docinfo = await docscan4nodejs.getDocumentInfo(host, doc.uid);
                                    // console.log('Document info:', docinfo);

                                    // let deletePage = await docscan4nodejs.deletePage(host, doc.uid, insertPage.pages[0].uid);
                                    // console.log('Delete page:', deletePage);
                                    let docfile = await docscan4nodejs.getDocumentFile(host, doc.uid, './');
                                    console.log('Document file:', docfile);

                                    let deleteDoc = await docscan4nodejs.deleteDocument(host, doc.uid);
                                    console.log('Delete document:', deleteDoc);

                                    await docscan4nodejs.deleteJob(host, jobId);
                                    askQuestion();
                                })();
                            }
                            catch (error) {
                                console.error('Job creation failed:', error.message);
                                askQuestion();
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