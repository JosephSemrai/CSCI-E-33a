document.addEventListener('DOMContentLoaded', () => {

    //DEBUG
    debugHeading = document.querySelector("#debugHeading").innerHTML = "YOU ARE IN DEBUG MODE (" + localStorage.getItem('username') + " UUID: " + localStorage.getItem('uuid') + ")";

    // Gets items from Jinja template's script which takes in the template parameters
    var username = localStorage.getItem('username');
    var uuid = localStorage.getItem('uuid');

    // Loads user panel
    updateUsersPanel();




    // Checks if there is a previous channel in memory
    if (localStorage.getItem('currentChannel')) {
        joinChannel(localStorage.getItem('currentChannel'));
    }

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //occurs when the create channel button is pressed to add a new channel
    document.querySelector('#addChannel').onclick = () => {
        //enables submit button only if there is text
        document.querySelector('#create-channel-name').onkeyup = () => {
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
            joinChannel(document.querySelector('#create-channel-name').value); //attempts to join the channel that was just created
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
        if (document.querySelector('.chatDiv') && lastChat.childNodes[0].childNodes[0].innerHTML == data.username) { //if there is at least one chat

            // IF ITS THE SAME USER AS THE LAST WHO JUST SENT A MESSAGE
            let chatContents = document.createElement('p');
            chatContents.className = "chatContents";
            chatContents.innerHTML = data.content;
            lastChat.append(chatContents);

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

            document.querySelector("#chatArea").append(chatItem)
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