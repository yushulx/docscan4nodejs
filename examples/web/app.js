const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

const docscan4nodejs = require("../../index.js")
const { PassThrough } = require('stream');

// let host = 'http://192.168.8.119:18622';
let host = 'http://127.0.0.1:18622';

const connections = new Map();
io.on('connection', (socket) => {
    connections.set(socket.id, socket);
    console.log(socket.id + ' connected');

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        connections.delete(socket.id);
    });

    socket.on('message', async (message) => {
        let data = JSON.parse(message);
        if (data) {
            if (data['scan']) {
                let parameters = {
                    license: "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==",
                    device: data['scan'],
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

                let json = await docscan4nodejs.createJob(host, parameters);
                let jobId = json.jobuid;

                let status = await docscan4nodejs.checkJob(host, jobId);
                console.log('Job status:', status);

                let streams = await docscan4nodejs.getImageStreams(host, jobId);
                for (let i = 0; i < streams.length; i++) {
                    await new Promise((resolve, reject) => {
                        try {
                            const passThrough = new PassThrough();
                            const chunks = [];

                            streams[i].pipe(passThrough);

                            passThrough.on('data', (chunk) => {
                                chunks.push(chunk);
                            });

                            passThrough.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                socket.emit('image', buffer);
                                resolve();
                            });
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                }
            }
        }
    });

    docscan4nodejs.getDevices(host, docscan4nodejs.ScannerType.TWAINSCANNER | docscan4nodejs.ScannerType.TWAINX64SCANNER).then((scanners) => {
        socket.emit('message', JSON.stringify({ 'devices': scanners }));
    });
});

// Start the server
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
