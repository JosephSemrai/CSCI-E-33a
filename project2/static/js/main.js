document.addEventListener('DOMContentLoaded', () => {
    var username = "test";

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //occurs when the create channel button is pressed to add a new channel
    document.querySelector('#add-channel').onclick = () => {
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
                alert("Button clicked!")
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
            if (data["messages"])
            {
                document.querySelector('#chatArea').innerHTML = "";
                for (var key in data["messages"])
                {
                    document.querySelector('#chatArea').append(data["messages"][key]["content"]);
                    
                }
            }
                
        }

        const data = new FormData();
        data.append('channelName', channelName);

        request.send(data);
    }

    //if in channel, make button depressed

    //send message
    messageBox = document.querySelector("#messageBox");
    messageBox.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        
        message = messageBox.value;

        if (message != "") //checks if the message is empty
        {
            sendMessage(messageBox.value);
            messageBox.value = "";
            //resets messagebox
        }
        else
        {
            alert("Message not valid. Is it empty?");
        }
        
    }
    });

    function sendMessage(content) {
        socket.emit('new message', {'channel': localStorage.getItem('currentChannel'), 'content': content, 'user': username});
    }

    //upon receiving a message
    socket.on('chat update', data => {
        document.querySelector("#chatArea").append(data.content)
    });
    

    





});