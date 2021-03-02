const { ipcRenderer } = require('electron');

//Custom message to test commands without controls
let logTextArea = document.getElementById('log');
document.getElementById('changeSocketDetails').addEventListener('click', updateSocketHandler);


function prndSetup() {
    let gear = document.getElementsByName('gear');
    for (var i = 0; i < gear.length; i++) {
        if (gear[i].checked) {
            let selectedGear = gear[i].value;
            ipcRenderer.send('messageToIPC', selectedGear);
            return;
        }
    }
}


//Eventlistener for message from IPC
ipcRenderer.on('messageFromIPC', function (e, data) {
    console.log('DATA RECEIVED:' + data);
    logTextArea.value += data + "\n";
})

function sendMessage() {
    console.log(document.getElementById('textMessage').value);
    ipcRenderer.send('messageToIPC', document.getElementById('textMessage').value);
}



//Setting initial socket connection
function updateSocketHandler(event) {
    let ipt = document.getElementById('newIPAddress');
    ip = ipt.value;
    ipt.readOnly = true;
    let portNotxt = document.getElementById('newPortNumber')
    let portNo = portNotxt.value || 'localhost';
    portNotxt.readOnly = true;

    let btn = document.getElementById('changeSocketDetails')
    btn.removeEventListener('click', updateSocketHandler);
    btn.style.visibility = 'hidden';

    document.getElementById('textHolder').textContent = "Server listening to " + ip + ":" + portNo;
    ipcRenderer.send("updateSocket", ip + "$" + portNo);
}