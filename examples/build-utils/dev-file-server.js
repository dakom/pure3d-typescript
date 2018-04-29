const os = require('os');
const express = require('express');
const path = require('path');
const fs = require('fs');
const serveIndex = require('serve-index');
const cors = require('cors');

console.log(os.platform());

const platform = os.platform();

let localPath = 
    platform === "darwin" || platform === "linux"
    ?   `assets`
    :   `assets`

localPath = path.resolve(localPath);

const app = express();

app.options('*', cors());
app.use(cors());
app.use(express.static(localPath), serveIndex(localPath, {'icons': true}));
app.listen(4101, () => console.log('Local dev file server started!'))
