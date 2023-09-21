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

app.post('/scandocument', async (req, res) => {
    const json = req.body;

    let parameters = {
        license: "LICENSE-KEY",
        device: json['scan'],
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

    let jobId = await docscan4nodejs.scanDocument(dynamsoftService, parameters);
    let filename = await docscan4nodejs.getImageFile(dynamsoftService, jobId, './public');

    res.send(JSON.stringify({
        'image': filename
    }));
});

// Start the server
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    host = server.address().address;
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
