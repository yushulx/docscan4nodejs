const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());

const docscan4nodejs = require("../../index.js");
let dynamsoftService = 'http://127.0.0.1:18622';

app.get('/devices', (req, res) => {

    docscan4nodejs.getDevices(dynamsoftService).then((scanners) => {
        res.send(JSON.stringify({ 'devices': scanners }));
    });
});

app.post('/createJob', async (req, res) => {
    const data = req.body;

    let parameters = {
        license: "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==",
        device: data['scan'],
        scannerFailureTimeout: 60
    };

    parameters.config = {
        IfShowUI: false,
        PixelType: 2,
        Resolution: 100,
        IfFeederEnabled: false,
        IfDuplexEnabled: false,
    };

    let json = await docscan4nodejs.createJob(dynamsoftService, parameters);
    let jobId = json.jobuid;
    if (jobId) {
        let filename = await docscan4nodejs.getImageFile(dynamsoftService, jobId, './public');
        await docscan4nodejs.deleteJob(dynamsoftService, jobId);

        res.send(JSON.stringify({
            'image': filename
        }));
    }
    else {
        res.send(JSON.stringify({
            'error': 'Failed to create job'
        }));
    }

});

// Start the server
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    host = server.address().address;
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
