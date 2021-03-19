const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');


var expressServer = require('./scripts/expressServer.js');
var data = require('./scripts/data');
let clientPort = data.getPortNumber();

const net = require('net');
let socket;
let win;

let PORT = 5000;
let HOST = 'localhost';
let clientName = 'Client1';

let socketReconnectTimerID;

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
    win.removeMenu();

    ipcMain.on('messageToIPC', (event, arg) => {
        if (arg) {
            socket.write(arg.toString());
        }
    })

    ipcMain.on('updateSocket', (event, arg)=>{
        if(arg){
            console.dir(arg);
            let argArr = arg.toString().split('$');
            HOST = argArr[0];
            PORT = argArr[1];
            clientName = argArr[2];
            initSocket(clientName);
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
///////Client//////

socket = new net.Socket();

socket.on("data", function(data) {
    let m = data.toString().replace(/[\n\r]*$/, '');
    win.webContents.send('messageFromIPC', m);
});

socket.on("error", function(err) {
    if(win)
    win.webContents.send('socketConnectionStatus', "Attempting connection to server on "+ HOST+":"+PORT);

    if(err.code == 'ECONNREFUSED'){
        if(socketReconnectTimerID){
            clearTimeout()
        }
        socketReconnectTimerID = setTimeout(()=>{
            initSocket();
        }, 2000);
    }
});

socket.on("close", function(err) {
    console.log("Socket connection closed");
});

function initSocket(clientName) {
    socket.removeAllListeners('connect');
    socket.connect(PORT, HOST, function() {
        socket.write("clientName:"+clientName);
    });
}



/////////////////////Socket connection//////////////////////////////////////////////
