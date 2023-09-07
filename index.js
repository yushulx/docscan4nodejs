const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    // Get available scanners
    getDevices: async function (host) {
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
    },
    // Create a scan job by feeding one or multiple physical documents
    scanDocument: async function (host, parameters) {
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
                console.log('Deleted:', response.data);
            })
            .catch(error => {
                // console.log('Error:', error);
            });
    },
    // Get document images by job id
    getImages: async function (host, jobId, directory) {
        let images = [];
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
};