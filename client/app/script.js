const { ipcRenderer } = require('electron');

let logTextArea = document.getElementById('log')

ipcRenderer.on('messageFromIPC', (e, data)=> {
    console.log('DATA RECEIVED:' + data);
    logTextArea.value += data + "\n";
})

ipcRenderer.on('socketConnectionStatus', (e, data)=>{
    document.getElementById('textHolder').textContent = data;
})

function sendMessage() {
    console.log(document.getElementById('textMessage').value);
    ipcRenderer.send('messageToIPC', document.getElementById('textMessage').value);
}

document.getElementById('changeSocketDetails').addEventListener('click', updateSocketHandler);

function updateSocketHandler(event) {
    let ipt = document.getElementById('newIPAddress');
    ip = ipt.value || 'localhost';
    ipt.readOnly = true;
    let portNotxt = document.getElementById('newPortNumber')
    let portNo = portNotxt.value || '5000';
    portNotxt.readOnly = true;

    let clientTXT = document.getElementById('clientName');
    let clientName = clientTXT.value;
    clientTXT.readOnly = true;

    let btn = document.getElementById('changeSocketDetails')
    btn.removeEventListener('click', updateSocketHandler);
    btn.style.visibility = 'hidden';    
    
    document.getElementById('textHolder').textContent = "Server listening to "+ip+":"+portNo;
    ipcRenderer.send("updateSocket",ip+"$"+portNo+"$"+clientName);
}