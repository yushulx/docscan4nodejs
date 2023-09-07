# docscan4nodejs
The package provides Node.js APIs for invoking **Dynamsoft Service REST API**. It helps developers to create **desktop** or **server-side** document scanning applications with ease. 

## Supported Scanner Drivers
- TWAIN
- WIA
- SANE
- ICA
- eSCL

## Supported Platforms
- Windows
- Linux
- macOS


## Prerequisites
-  Install [Dynamsoft Service for Windows](https://www.dynamsoft.com/codepool/downloads/DynamsoftServiceSetup.msi).
    
    Currently, the REST API is only available on **Windows**. It will come to **Linux (x64, ARM64)** and **macOS** soon.
- Request a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt) for Dynamsoft Service.

## Dynamsoft Service Configuration
After installing the Dynamsoft Service, navigate to `http://127.0.0.1:18625/` in a web browser to configure the host and port settings. The default host IP address is set to 127.0.0.1. If you wish to make the service accessible over the network, you can update the host setting to a public IP address.

![dynamsoft-service-config](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/e2b1292e-dfbd-4821-bf41-70e2847dd51e)


## JavaScript API
- `getDevices(host)` - Get all available scanners. It returns an array of scanner objects.
- `scanDocument(host, parameters)` - Create a scanner job by feeding one or multiple physical documents. It returns the job id.
- `getImages(host, jobId, directory)` - Get document images by job id. The directory specifies the physical location to save the images. It returns an array of image paths.
- `deleteJob(host, jobId)` - Delete a scan job by job id. It can interrupt the scan process.

## Parameter Configuration
The parameter configuration is based on [Dynamsoft Web TWAIN documentation](https://www.dynamsoft.com/web-twain/docs/info/api/Interfaces.html#DeviceConfiguration). It controls the behavior of the scanner. 

For example, you can set the resolution to 200 DPI and the pixel type to color:

```js
let parameters = {
    license: "LICENSE-KEY",
    device: devices[index].device,
};

parameters.config = {
    IfShowUI: false,
    PixelType: 2, // color
    Resolution: 200,
    IfFeederEnabled: false,
    IfDuplexEnabled: false,
};
```

## Quick Start
Set the `LICENSE-KEY` in the code below. Then, run the code in a terminal:

```js
const docscan4nodejs = require("docscan4nodejs")
const readline = require('readline');

let devices = [];
let host = 'http://127.0.0.1:18622';

const questions = `
Please select an operation:
1. Get scanners
2. Acquire documents by scanner index
3. Quit
`
let rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function askQuestion() {
    rl.question(questions, function (answer) {
        if (answer === '3') {
            rl.close();
        }
        else if (answer === '1') {
            docscan4nodejs.getDevices(host).then((scanners) => {
                for (let i = 0; i < scanners.length; i++) {
                    devices.push(scanners[i]);
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
                            Resolution: 200,
                            IfFeederEnabled: false,
                            IfDuplexEnabled: false,
                        };

                        docscan4nodejs.scanDocument(host, parameters).then((jobId) => {
                            if (jobId !== '') {
                                console.log('job id: ' + jobId);
                                (async () => {
                                    let images = await docscan4nodejs.getImages(host, jobId, './');
                                    await docscan4nodejs.deleteJob(jobId);
                                    askQuestion();
                                })();
                            }
                        });
                    }
                }
            });
        }
    });
}

askQuestion();
```

- Get all available scanners

    ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/24fcb45d-1bea-45ba-9569-b9a2ef377b63)

- Acquire a Document
    
    ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/2688269d-4f05-4734-bf1c-7ba4e2638d66)


