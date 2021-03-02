var express = require('express');
var exapp = express();

var path = require('path');
var fs = require("fs");

var data = require('./data.js'); //Reference to common data

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
exapp.use(bodyParser.json());

var mainWindow;         //Reference to main browser window

//Start web server at port mentioned in data.js
exports.startExpressServer = function (mv) {
    mainWindow = mv;
    var portNumber = data.getPortNumber();

    var url = path.normalize(__dirname + '/../');
    exapp.use(express.static(url + 'app'));
    exapp.listen(process.env.PORT || portNumber);
};