// Gets items from Jinja template's script which takes in the template parameters
var username = localStorage.getItem('username');
var uuid = localStorage.getItem('uuid');

var socket;


document.addEventListener('DOMContentLoaded', () => {

    //DEBUG
    debugHeading = document.querySelector("#debugHeading").innerHTML = "YOU ARE IN DEBUG MODE (" + localStorage.getItem('username') + " UUID: " + localStorage.getItem('uuid') + ")";

    // Connect to websocket
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


    // Loads user panel
    updateUsersPanel();

    // Checks if there is a previous channel in memory
    if (localStorage.getItem('currentChannel')) {
        joinChannel(localStorage.getItem('currentChannel'));
    }

    //occurs when the create channel button is pressed to add a new channel
    document.querySelector('#addChannel').onclick = () => {
        //enables submit button only if there is text
        document.querySelector(newFunction()).onkeyup = () => {
            if (document.querySelector('#create-channel-name').value.length > 0)
                document.querySelector('#create-channel-button').disabled = false;
            else
                document.querySelector('#create-channel-button').disabled = true;
        };
        //dismisses modal and sends info on button press
        document.querySelector('#create-channel-button').onclick = () => {
            //attempts to create the channel
            socket.emit('create channel', {
                'channelname': document.querySelector('#create-channel-name').value
            });
            $('#channelModal').modal('hide');
            document.querySelector('#create-channel-name').value = "";
        };

    };

    //receives new channel broadcast
    socket.on('all channels', data => {

        //removes everything in the list before appending the new list
        let channelList = document.querySelector("#channel-list")
        while (channelList.firstChild) {
            channelList.removeChild(channelList.firstChild);
        }

        //creates the new list
        channels = data.channels;
        for (let i = 0; i < channels.length; i++) {
            let element = document.createElement('button');
            element.className = "btn btn-danger channelListButton";
            element.value = channels[i];
            element.innerHTML = channels[i];
            channelList.append(element);
        }
        joinChannelButton();
    });

    joinChannelButton();

    function joinChannelButton() {
        document.querySelectorAll('.channelListButton').forEach(button => {
            button.onclick = () => {
                joinChannel(button.value);
            };
        });
    }

    function joinChannel(channelName) {
        localStorage.setItem('currentChannel', channelName);
        document.querySelector('#chatTitle').innerHTML = channelName;
        //gets messages and other channel data
        const request = new XMLHttpRequest();
        request.open('POST', '/fetchChannel');

        //callback
        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            if (data["messages"]) {
                document.querySelector('#chatArea').innerHTML = "";
                for (var key in data["messages"]) {
                    createMessage(data["messages"][key]);
                }
            }

        }

        const data = new FormData();
        data.append('channelName', channelName);

        request.send(data);

        return true;
    }

    //if in channel, make button depressed

    //send message
    messageBox = document.querySelector("#messageBox");
    messageBox.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) { //checks whether the pressed key is "Enter"
            message = messageBox.value;

            if (message != "") //checks if the message is empty
            {
                sendMessage(message);
                messageBox.value = "";
                //resets messagebox
            } else {
                alert("Message not valid. Is it empty?");
            }

        }
    });

    function sendMessage(content) {
        socket.emit('new message', {
            'type': 'message',
            'channel': localStorage.getItem('currentChannel'),
            'content': content,
            'uuid': uuid,
            'time': moment().unix()
        });
    }

    //upon receiving a message
    socket.on('chat update', data => {
        createMessage(data);
    });

    function createMessage(data) {

        let nodes = document.querySelectorAll('.chatDiv'); //gets all inner chat divs
        let lastChat = nodes[nodes.length - 1];
        if (document.querySelector('.chatDiv') && lastChat.childNodes[0].childNodes[0].innerHTML == data.username) { //if there is at least one chat and if it's the same user

            if ((data.type) != "message") { //if it's an attachment
                alert("File!");
                blob = dataURItoBlob(data.content);
                var url = window.URL.createObjectURL(blob);

                let chatContents = document.createElement('a');
                chatContents.className = "chatContentsAttachment";
                chatContents.innerHTML = "Download Attachment";
                chatContents.href = url;
                chatContents.download = url.split('/').pop(); //gets everything past the blob beginning url
                lastChat.append(chatContents);

            } else {
                let chatContents = document.createElement('p');
                chatContents.className = "chatContents";
                chatContents.innerHTML = data.content;
                lastChat.append(chatContents);
            }

        } else {

            if ((data.type) != "message") { //if it's an attachment
                alert("File!");
                let chatItem = document.createElement('div');
                chatItem.className = "chatItem";


                let chatProfileImg = document.createElement('div');
                chatProfileImg.className = "chatProfileImg";
                let chatDiv = document.createElement('div');
                chatDiv.className = "chatDiv";
                let chatContents = document.createElement('p');
                chatContents.className = "chatContentsAttachment";
                let chatUser = document.createElement('p');
                chatUser.className = "chatUser";
                let chatTime = document.createElement('time');
                chatTime.className = "chatTime";
                chatTime.dateTime = data.time;
                let chatHeading = document.createElement('div');
                chatHeading.className = "chatHeading";

                chatHeading.append(chatUser);
                chatHeading.append(chatTime);

                chatContents.innerHTML = data.content;
                chatUser.innerHTML = data.username;
                chatTime.innerHTML = moment.unix(data.time).calendar();


                chatDiv.append(chatHeading);
                chatDiv.append(chatContents);

                chatItem.append(chatProfileImg);
                chatItem.append(chatDiv);

                document.querySelector("#chatArea").append(chatItem);

            } else {
                let chatItem = document.createElement('div');
                chatItem.className = "chatItem";


                let chatProfileImg = document.createElement('div');
                chatProfileImg.className = "chatProfileImg";
                let chatDiv = document.createElement('div');
                chatDiv.className = "chatDiv";
                let chatContents = document.createElement('p');
                chatContents.className = "chatContents";
                let chatUser = document.createElement('p');
                chatUser.className = "chatUser";
                let chatTime = document.createElement('time');
                chatTime.className = "chatTime";
                chatTime.dateTime = data.time;
                let chatHeading = document.createElement('div');
                chatHeading.className = "chatHeading";

                chatHeading.append(chatUser);
                chatHeading.append(chatTime);

                chatContents.innerHTML = data.content;
                chatUser.innerHTML = data.username;
                chatTime.innerHTML = moment.unix(data.time).calendar();


                chatDiv.append(chatHeading);
                chatDiv.append(chatContents);

                chatItem.append(chatProfileImg);
                chatItem.append(chatDiv);

                document.querySelector("#chatArea").append(chatItem);
            }

        }




        let chatArea = document.getElementById('chatArea');
        chatArea.scrollTop = chatArea.scrollHeight;
    }


    // user update dealings
    socket.on("users update", () => {
        updateUsersPanel();
    });

    function updateUsersPanel() {
        const request = new XMLHttpRequest();
        request.open('POST', '/fetchServerUsers');

        //callback
        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            if (data["allusers"]) {
                document.querySelector('#offlineUsers').innerHTML = "";
                for (var key in data["allusers"]) {
                    document.querySelector('#offlineUsers').append(data["allusers"][key].username);
                }
            }

        }

        request.send();

        return true;
    }

});
// ***********************
// Drag and drop functions
// ***********************

var lastTarget = null;

window.addEventListener("dragenter", function (e) {
    lastTarget = e.target; // cache the last target here
    // unhide our dropzone overlay
    document.querySelector(".dropzone").style.visibility = "";
    document.querySelector(".dropzone").style.opacity = 1;
});

window.addEventListener("dragleave", function (e) {
    // this is the magic part. when leaving the window,
    // e.target happens to be exactly what we want: what we cached
    // at the start, the dropzone we dragged into.
    // so..if dragleave target matches our cache, we hide the dropzone.
    if (e.target === lastTarget || e.target === document) {
        hideDropzone();
    }
});

function newFunction() {
    return '#create-channel-name';
}

function hideDropzone() {
    document.querySelector(".dropzone").style.visibility = "hidden";
    document.querySelector(".dropzone").style.opacity = 0;
}

function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

function dropHandler(ev) {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                console.log('... file[' + i + '].name = ' + file.name);
                sendAttachment(file);
                alert(file.type);

            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
            sendAttachment(ev.dataTransfer.files[i]);
        }
    }
}

function sendAttachment(file) {
    // var formData = new FormData();
    // formData.append('channel', localStorage.getItem('currentChannel'));
    // formData.append('username', username);
    // formData.append('time', moment().unix);
    // formData.append('uuid', uuid);
    // formData.append('file', file);
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', '/sendAttachment', true);
    // xhr.send(formData);
    newBlob = new Blob([file], {
        type: String(file.type)
    });
    var reader = new FileReader();
    reader.onload = function() {
        socket.emit('new attachment', {
            'type': file.type,
            'channel': localStorage.getItem('currentChannel'),
            'content': reader.result,
            'uuid': uuid,
            'time': moment().unix()
        });
    }
    reader.readAsDataURL(newBlob);

    

    hideDropzone();
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }