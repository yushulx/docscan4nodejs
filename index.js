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

const JobStatus = {
    RUNNING: 'running',
    CANCELED: 'canceled',
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

        req.on('error', (err) => {
            if (err.code === 'ECONNRESET') {
                console.error('ECONNRESET!!!', {
                    url: options.url,
                    retryCount: options.retryCount || 0
                });
            }
            reject(err);
        });

        if (options.body) {
            req.write(typeof options.body === 'string'
                ? options.body
                : JSON.stringify(options.body));
        }
        req.end();
    });
}

// Get server version information
async function getServerInfo(host) {
    try {
        const response = await request({
            url: `${host}/api/server/version`,
            method: 'GET',
            json: true
        });
        return response.data;
    } catch (error) {
        return {
            version: error.message,
            compatible: false
        };
    }
}

// Fetch single image file and save to directory
async function getImageFile(host, jobId, directory) {
    const url = `${host}/api/device/scanners/jobs/${jobId}/next-page`;
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
    const url = `${host}/api/device/scanners/jobs/${jobId}/next-page`;

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

// Get available scanning devices
async function getDevices(host, scannerType) {
    let url = `${host}/api/device/scanners`;
    if (scannerType != null) url += `?type=${scannerType}`;

    try {
        const response = await request({
            url,
            method: 'GET',
            json: true
        });

        if (response.data.length > 0) {
            return response.data;
        }
    } catch (error) {
        console.error('Device discovery failed:', error.message);
    }
    return [];
}

// Create new scan job
async function createJob(host, parameters) {
    const url = `${host}/api/device/scanners/jobs`;

    try {
        const response = await request({
            url,
            method: 'POST',
            headers: {
                'X-DICS-LICENSE-KEY': parameters.license,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
            },
            json: true,
            body: parameters
        });
        if (response.status !== 201) {
            console.log('Job created:', response);
        }

        return response.data;
    } catch (error) {
        console.error('Scan job creation failed:', error.message);
        return '';
    }
}

// Retrive the job status
async function checkJob(host, jobId) {
    const url = `${host}/api/device/scanners/jobs/${jobId}`;

    try {
        const response = await request({
            url,
            method: 'GET',
            json: true
        });

        return response.status === 200 ? response.data : '';
    } catch (error) {
        console.error('Scan job creation failed:', error.message);
        return '';
    }
}

// Delete existing scan job
async function deleteJob(host, jobId) {
    if (!jobId) return;

    const url = `${host}/api/device/scanners/jobs/${jobId}`;
    try {
        await request({
            url,
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Job deletion failed:', error.message);
    }
}

// Update existing scan job status (e.g. 'running', canceled)
async function updateJob(host, jobId, parameters) {
    const url = `${host}/api/device/scanners/jobs/${jobId}`;

    try {
        const response = await request({
            url,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
            },
            json: true,
            body: parameters
        });

        return response.status === 200 ? response.data : '';
    } catch (error) {
        console.error('Scan job creation failed:', error.message);
        return '';
    }
}

// Get scanner capabilities
async function getScannerCapabilities(host, jobId) {
    const url = `${host}/api/device/scanners/jobs/${jobId}/scanner/capabilities`;

    try {
        const response = await request({
            url,
            method: 'GET',
            json: true
        });

        return response.status === 200 ? response.data : '';
    }
    catch (error) {
        console.error('Scan job creation failed:', error.message);
        return '';
    }
}

// Get multiple image files
async function getImageFiles(host, jobId, directory) {
    const images = [];
    console.log('Starting image download...');

    while (true) {
        const filename = await getImageFile(host, jobId, directory);
        if (!filename) break;
        images.push(filename);
    }
    return images;
}

// Get multiple image streams
async function getImageStreams(host, jobId) {
    const streams = [];

    while (true) {
        const stream = await getImageStream(host, jobId);
        if (!stream) break;
        streams.push(stream);
    }
    return streams;
}

// Get image information
async function getImageInfo(host, jobId) {
    const url = `${host}/api/device/scanners/jobs/${jobId}/next-page-info`;

    try {
        const response = await request({
            url,
            method: 'GET',
            json: true
        });

        return response.status === 200 ? response.data : '';
    } catch (error) {
        console.error('Image info fetch failed:', error.message);
        return '';
    }
}

////////////////////////
// Document functions

// Create a new document
async function createDocument(host, parameters) {
    const url = `${host}/api/storage/documents`;

    try {
        const response = await request({
            url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
            },
            json: true,
            body: parameters
        });
        console.log('Document created:', response);
        return response.status === 201 ? response.data : '';
    }
    catch (error) {
        console.error('Document creation failed:', error.message);
        return '';
    }
}

// Get document information
async function getDocumentInfo(host, docId) {
    const url = `${host}/api/storage/documents/${docId}`;

    try {
        const response = await request({
            url,
            method: 'GET',
            json: true
        });

        return response.status === 200 ? response.data : '';
    }
    catch (error) {
        console.error('Document info fetch failed:', error.message);
        return '';
    }
}

// Delete existing document
async function deleteDocument(host, docId) {
    const url = `${host}/api/storage/documents/${docId}`;

    try {
        const response = await request({
            url,
            method: 'DELETE'
        });

        return response.status === 204 ? 'Document deleted' : '';
    }
    catch (error) {
        console.error('Document deletion failed:', error.message);
    }
}

// Fetch document file and save to directory
async function getDocumentFile(host, docId, directory) {
    const url = `${host}/api/storage/documents/${docId}/content`;

    try {
        const response = await request({
            url,
            method: 'GET',
            stream: true
        });

        if (response.status === 200) {
            return new Promise((resolve, reject) => {
                const filename = `document_${Date.now()}.pdf`;
                const imagePath = path.join(directory, filename);
                const writer = fs.createWriteStream(imagePath);

                // Pipe response stream to file
                response.stream.pipe(writer);

                // Handle successful write
                writer.on('finish', () => {
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
    }
    catch (error) {
        console.error('Document fetch failed:', error.message);
    }
}

// Fetch document stream
async function getDocumentStream(host, docId) {
    const url = `${host}/api/storage/documents/${docId}/content`;

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

// Insert a new page into an existing document
async function insertPage(host, docId, parameters) {
    const url = `${host}/api/storage/documents/${docId}/pages`;

    try {
        const response = await request({
            url,
            method: 'POST',
            headers: {
                'X-DICS-DOC-PASSWORD': parameters.password,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(parameters))
            },
            json: true,
            body: parameters
        });
        return response.status === 200 ? response.data : '';
    }
    catch (error) {
        console.error('Page insertion failed:', error.message);
        return '';
    }
}

// Delete an existing page from a document
async function deletePage(host, docId, pageId) {
    const url = `${host}/api/storage/documents/${docId}/pages/${pageId}`;

    try {
        const response = await request({
            url,
            method: 'DELETE'
        });

        return response.status === 204 ? 'Page deleted' : '';
    }
    catch (error) {
        console.error('Page deletion failed:', error.message);
    }
}

module.exports = {
    ScannerType,
    JobStatus,
    getServerInfo,
    getDevices,
    createJob,
    deleteJob,
    updateJob,
    checkJob,
    getImageFile,
    getImageStream,
    getImageFiles,
    getImageStreams,
    getScannerCapabilities,
    getImageInfo,
    createDocument,
    getDocumentInfo,
    deleteDocument,
    getDocumentFile,
    getDocumentStream,
    insertPage,
    deletePage
};