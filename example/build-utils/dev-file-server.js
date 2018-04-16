const os = require('os');
const express = require('express');
const path = require('path');
const fs = require('fs');
const serveIndex = require('serve-index');
const cors = require('cors');

let localPath = 
    os.platform() === "darwin"
    ?   `/Users/davidk/Documents/github/KhronosGroup/glTF-Sample-Models/2.0`
    :   `Y:\\KhronosGroup\\glTF-Sample-Models\\2.0`

localPath = path.resolve(localPath);

const app = express();

app.options('*', cors());
app.use(cors());
app.use(express.static(localPath), serveIndex(localPath, {'icons': true}));
app.listen(4101, () => console.log('Local dev file server started!'))