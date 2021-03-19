const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

const fs = require('fs');
const path = require('path');


var expressServer = require('./scripts/expressServer.js');
var data = require('./scripts/data');
let clientPort = data.getPortNumber();


let socketCount = 0;

let win;

let PORT = 5000;
let ADDRESS = '127.0.0.1';


const net = require('net');
let socket;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    expressServer.startExpressServer(win);
    win.loadURL('http://localhost:' + clientPort);
    //win.webContents.openDevTools();
    win.removeMenu()

    ipcMain.on('messageToIPC', (event, arg) => {
        if (arg) {
            for (let i = 0; i < clientList.length; i++) {
                clientList[i].s.write(arg.toString());
            }
        }
    })

    ipcMain.on('updateSocket', (event, arg) => {
        if (arg) {
            console.dir(arg);
            ADDRESS = arg.toString().split('$')[0];
            PORT = arg.toString().split('$')[1];
            startSocketServer();
        }
    });
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

/////////////////////Socket connection//////////////////////////////////////////////
///////Sever//////

function startSocketServer() {
    server = net.createServer(onClientConnected);
    server.listen(PORT, ADDRESS);

    server.on('error', (e) => {
        console.log("errror " + e)
    });


    server.on('ready', () => {
        console.log("server ready to listen....");
    })
}

var clientList = [];

function onClientConnected(soc) {

    console.log("On client connection");
    socket = soc
    socket.id = socketCount++;
    ra = socket.remoteAddress;
    rp = socket.remotePort;
    clientList.push({ s: soc, id: socketCount, ra: ra, rp: rp });


    socket.on('data', function (data) {
        let m = data.toString().replace(/[\n\r]*$/, '');

        for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].s != soc) {
                try {
                    clientList[i].s.write(m);
                } catch (error) {
                    console.log(error)
                } finally {
                    //No
                }
            } else {
                if (win) {
                    win.webContents.send('messageFromIPC', m + " - " + clientList[i].ra + ":" + clientList[i].rp);
                }
            }
        }
    });

    socket.on('connection', function () {
        console.log("Client connected");
    })

    socket.on('end', function () {
        console.log(`disconnected.` + socket);
        for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].s == socket) {
                console.log("Found a match....");
                clientList.splice(i, 1);
            }
        }
    });
}
/////////////////////Socket connection//////////////////////////////////////////////

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 9898}),
    websocketClients=[];

wss.on('connection', function(ws) {
    websocketClients.push(ws);
    ws.on('message', function(message) {
        //sendAll(message);
        for (var i=0; i<websocketClients.length; i++) {

            if(websocketClients[i] != ws){
                websocketClients[i].send("Message: " + message);
            }else{
                console.log("Matched client who send ")
            }  
        }
    });
});
