const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const ScannerType = {
    TWAINSCANNER: 0x10,
    WIASCANNER: 0x20,
    TWAINX64SCANNER: 0x40,
    ICASCANNER: 0x80,
    SANESCANNER: 0x100,
    ESCLSCANNER: 0x200,
    WIFIDIRECTSCANNER: 0x400,
    WIATWAINSCANNER: 0x800
};

// Unified HTTP/HTTPS request handler
function request(options) {
    return new Promise((resolve, reject) => {
        const url = new URL(options.url);
        const protocol = url.protocol === 'https:' ? https : http;

        const reqOptions = {
            hostname: url.hostname,
            port: url.port || (protocol === https ? 443 : 80),
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = protocol.request(reqOptions, (res) => {
            // Handle stream response directly
            if (options.stream) {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    stream: res
                });
                return;
            }

            // Handle buffered response
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                try {
                    resolve({
                        status: res.statusCode,
                        data: options.json ? JSON.parse(body.toString()) : body.toString()
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body.toString()
                    });
                }
            });
        });

        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string'
                ? options.body
                : JSON.stringify(options.body));
        }
        req.end();
    });
}

// Fetch single image file and save to directory
async function getImageFile(host, jobId, directory) {
    const url = `${host}/DWTAPI/ScanJobs/${jobId}/NextDocument`;

    try {
        const response = await request({
            url,
            method: 'GET',
            stream: true
        });

        if (response.status === 200) {
            return new Promise((resolve, reject) => {
                const filename = `image_${Date.now()}.jpg`;
                const imagePath = path.join(directory, filename);
                const writer = fs.createWriteStream(imagePath);

                // Pipe response stream to file
                response.stream.pipe(writer);

                // Handle successful write
                writer.on('finish', () => {
                    console.log('Saved image to', imagePath);
                    resolve(filename);
                });

                // Handle errors
                const handleError = (err) => {
                    writer.destroy();
                    reject(err);
                };

                writer.on('error', handleError);
                response.stream.on('error', handleError);

                // Handle timeout (30 seconds)
                const timeout = setTimeout(() => {
                    handleError(new Error('Download timeout'));
                }, 30000);

                writer.on('close', () => clearTimeout(timeout));
            });
        }
    } catch (error) {
        console.error('Image download failed:', error.message);
        return '';
    }
}

// Fetch single image stream
async function getImageStream(host, jobId) {
    const url = `${host}/DWTAPI/ScanJobs/${jobId}/NextDocument`;

    try {
        const response = await request({
            url,
            method: 'GET',
            stream: true
        });

        if (response.status === 200) {
            return response.stream;
        }
    } catch (error) {
        console.error('Stream fetch failed:', error.message);
    }
    return null;
}

module.exports = {
    // Get available scanning devices
    getDevices: async function (host, scannerType) {
        let url = `${host}/DWTAPI/Scanners`;
        if (scannerType != null) url += `?type=${scannerType}`;

        try {
            const response = await request({
                url,
                json: true
            });

            if (response.data.length > 0) {
                console.log('Available scanners:', response.data.length);
                return response.data;
            }
        } catch (error) {
            console.error('Device discovery failed:', error.message);
        }
        return [];
    },

    // Create new scan job
    scanDocument: async function (host, parameters, timeout = 30) {
        const url = `${host}/DWTAPI/ScanJobs?timeout=${timeout}`;

        try {
            const response = await request({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
                },
                body: parameters
            });

            return response.status === 201 ? response.data : '';
        } catch (error) {
            console.error('Scan job creation failed:', error.message);
            return '';
        }
    },

    // Delete existing scan job
    deleteJob: async function (host, jobId) {
        if (!jobId) return;

        const url = `${host}/DWTAPI/ScanJobs/${jobId}`;
        try {
            await request({
                url,
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Job deletion failed:', error.message);
        }
    },

    getImageFile,
    getImageStream,

    // Get multiple image files
    getImageFiles: async function (host, jobId, directory) {
        const images = [];
        console.log('Starting image download...');

        while (true) {
            const filename = await getImageFile(host, jobId, directory);
            if (!filename) break;
            images.push(filename);
        }
        return images;
    },

    // Get multiple image streams
    getImageStreams: async function (host, jobId) {
        const streams = [];
        console.log('Starting stream collection...');

        while (true) {
            const stream = await getImageStream(host, jobId);
            if (!stream) break;
            streams.push(stream);
        }
        return streams;
    },

    ScannerType
};