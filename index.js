const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ScannerType = {
    // TWAIN scanner type, represented by the value 0x10
    TWAINSCANNER: 0x10,

    // WIA scanner type, represented by the value 0x20
    WIASCANNER: 0x20,

    // 64-bit TWAIN scanner type, represented by the value 0x40
    TWAINX64SCANNER: 0x40,

    // ICA scanner type, represented by the value 0x80
    ICASCANNER: 0x80,

    // SANE scanner type, represented by the value 0x100
    SANESCANNER: 0x100,

    // eSCL scanner type, represented by the value 0x200
    ESCLSCANNER: 0x200,

    // WiFi Direct scanner type, represented by the value 0x400
    WIFIDIRECTSCANNER: 0x400,

    // WIA-TWAIN scanner type, represented by the value 0x800
    WIATWAINSCANNER: 0x800
};

async function getImageFile(host, jobId, directory) {
    let url = host + '/DWTAPI/ScanJobs/' + jobId + '/NextDocument';
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
        });

        if (response.status == 200) {
            let filename = await new Promise((resolve, reject) => {
                const timestamp = Date.now();
                const filename = `image_${timestamp}.jpg`;
                const imagePath = path.join(directory, filename);
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);
                writer.on('finish', () => {
                    console.log('Saved image to ' + imagePath + '\n');
                    resolve(filename);
                });

                writer.on('error', (err) => {
                    console.log(err);
                    reject(err);
                });
            });
            return filename;
        }
        else {
            console.log(response);
        }

    } catch (error) {
        // console.error("Error downloading image:", error);
        console.error('No more images.');
        return '';
    }

    return '';
}

module.exports = {
    // Get available scanners
    getDevices: async function (host, scannerType) {
        devices = [];
        // Device type: https://www.dynamsoft.com/web-twain/docs/info/api/Dynamsoft_Enum.html
        // http://127.0.0.1:18622/DWTAPI/Scanners?type=64 for TWAIN only
        let url = host + '/DWTAPI/Scanners'
        if (scannerType != null) {
            url += '?type=' + scannerType;
        }

        try {
            let response = await axios.get(url)
                .catch(error => {
                    console.log(error);
                });

            if (response.status == 200 && response.data.length > 0) {
                console.log('\nAvailable scanners: ' + response.data.length);
                return response.data;
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    },
    // Create a scan job by feeding one or multiple physical documents
    scanDocument: async function (host, parameters, timeout = 30) {
        let url = host + '/DWTAPI/ScanJobs?timeout=' + timeout;

        try {
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
        }
        catch (error) {
            console.log(error);
        }


        return '';
    },
    // Delete a scan job by job id
    deleteJob: async function (host, jobId) {
        if (!jobId) return;

        let url = host + '/DWTAPI/ScanJobs/' + jobId;
        console.log('Delete job: ' + url);
        axios({
            method: 'DELETE',
            url: url
        })
            .then(response => {
                // console.log('Status:', response.status);
            })
            .catch(error => {
                // console.log('Error:', error);
            });
    },
    // Get one document image file by job id
    getImageFile: getImageFile,
    // Get document image files by job id
    getImageFiles: async function (host, jobId, directory) {
        let images = [];
        console.log('Start downloading images......');
        while (true) {
            let filename = await getImageFile(host, jobId, directory);
            if (filename === '') {
                break;
            }
            else {
                images.push(filename);
            }
        }

        return images;
    },
    // Get document image streams by job id
    getImageStreams: async function (host, jobId) {
        let streams = [];
        let url = host + '/DWTAPI/ScanJobs/' + jobId + '/NextDocument';
        console.log('Start downloading images......');
        while (true) {
            try {
                const response = await axios({
                    method: 'GET',
                    url: url,
                    responseType: 'stream',
                });

                if (response.status == 200) {
                    streams.push(response.data);
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

        return streams;
    },
    ScannerType: ScannerType
};