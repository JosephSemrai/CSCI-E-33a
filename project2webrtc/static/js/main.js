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


    // ***********************
    // WebRTC and Voice/Video Chat
    // ***********************
    

    var USE_AUDIO = true;
    var USE_VIDEO = false;
    var DEFAULT_CHANNEL = 'some-global-channel-name';
    var MUTE_AUDIO_BY_DEFAULT = false;

    /** You should probably use a different stun server doing commercial stuff **/
    /** Also see: https://gist.github.com/zziuni/3741933 **/
    var ICE_SERVERS = [{
        url: "stun:stun.l.google.com:19302"
    }];

    var local_media_stream = null; /* our own microphone / webcam */
    var peers = {}; /* keep track of our peer connections, indexed by peer_id (aka socket.io id) */
    var peer_media_elements = {}; /* keep track of our <video>/<audio> tags, indexed by peer_id */

    init();

    function init() {
        console.log("Connecting to signaling server");

        socket.on('connect', function () {
            console.log("Connected to signaling server");
            setup_local_media(function () {
                /* once the user has given us access to their
                 * microphone/camcorder, join the channel and start peering up */
                join_chat_channel(DEFAULT_CHANNEL, {
                    'id': uuid
                });
            });
        });
        socket.on('disconnect', function () { //ADDRESS THIS LATER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            console.log("Disconnected from signaling server");
            /* Tear down all of our peer connections and remove all the
             * media divs when we disconnect */
            for (peer_id in peer_media_elements) {
                peer_media_elements[peer_id].remove();
            }
            for (peer_id in peers) {
                peers[peer_id].close();
            }

            peers = {};
            peer_media_elements = {};
        });

        function join_chat_channel(channel, userdata) {
            alert("Sending: " + userdata)
            socket.emit('join', {
                "channel": channel,
                "userdata": userdata
            });
        }

        function part_chat_channel(channel) {
            socket.emit('part', channel);
        }


        /** 
         * When we join a group, our signaling server will send out 'addPeer' events to each pair
         * of users in the group (creating a fully-connected graph of users, ie if there are 6 people
         * in the channel you will connect directly to the other 5, so there will be a total of 15 
         * connections in the network). 
         */
        socket.on('addPeer', function (config) {
            console.log('Signaling server said to add peer:', config);
            var peer_id = config.peer_id;
            if (peer_id in peers) {
                /* This could happen if the user joins multiple channels where the other peer is also in. */
                console.log("Already connected to peer ", peer_id);
                return;
            }
            var peer_connection = new RTCPeerConnection({
                    "iceServers": ICE_SERVERS
                }, {
                    "optional": [{
                        "DtlsSrtpKeyAgreement": true
                    }]
                }
                /* this will no longer be needed by chrome
                 * eventually (supposedly), but is necessary 
                 * for now to get firefox to talk to chrome */
            );
            peers[peer_id] = peer_connection;

            peer_connection.onicecandidate = function (event) {
                if (event.candidate) {
                    socket.emit('relayICECandidate', {
                        'peer_id': peer_id,
                        'ice_candidate': {
                            'sdpMLineIndex': event.candidate.sdpMLineIndex,
                            'candidate': event.candidate.candidate
                        }
                    });
                }
            }
            peer_connection.onaddstream = function (event) {
                console.log("onAddStream", event);
                var remote_media = USE_VIDEO ? $("<video>") : $("<audio>");
                remote_media.attr("autoplay", "autoplay");
                if (MUTE_AUDIO_BY_DEFAULT) {
                    remote_media.attr("muted", "true");
                }
                remote_media.attr("controls", "");
                peer_media_elements[peer_id] = remote_media;
                $('body').append(remote_media);
                attachMediaStream(remote_media[0], event.stream);
            }

            /* Add our local stream */
            peer_connection.addStream(local_media_stream);

            /* Only one side of the peer connection should create the
             * offer, the signaling server picks one to be the offerer. 
             * The other user will get a 'sessionDescription' event and will
             * create an offer, then send back an answer 'sessionDescription' to us
             */
            if (config.should_create_offer) {
                console.log("Creating RTC offer to ", peer_id);
                peer_connection.createOffer(
                    function (local_description) {
                        console.log("Local offer description is: ", local_description);
                        peer_connection.setLocalDescription(local_description,
                            function () {
                                socket.emit('relaySessionDescription', {
                                    'peer_id': peer_id,
                                    'session_description': local_description
                                });
                                console.log("Offer setLocalDescription succeeded");
                            },
                            function () {
                                Alert("Offer setLocalDescription failed!");
                            }
                        );
                    },
                    function (error) {
                        console.log("Error sending offer: ", error);
                    });
            }
        });


        /** 
         * Peers exchange session descriptions which contains information
         * about their audio / video settings and that sort of stuff. First
         * the 'offerer' sends a description to the 'answerer' (with type
         * "offer"), then the answerer sends one back (with type "answer").  
         */
        socket.on('sessionDescription', function (config) {
            console.log('Remote description received: ', config);
            var peer_id = config.peer_id;
            var peer = peers[peer_id];
            var remote_description = config.session_description;
            console.log(config.session_description);

            var desc = new RTCSessionDescription(remote_description);
            var stuff = peer.setRemoteDescription(desc,
                function () {
                    console.log("setRemoteDescription succeeded");
                    if (remote_description.type == "offer") {
                        console.log("Creating answer");
                        peer.createAnswer(
                            function (local_description) {
                                console.log("Answer description is: ", local_description);
                                peer.setLocalDescription(local_description,
                                    function () {
                                        socket.emit('relaySessionDescription', {
                                            'peer_id': peer_id,
                                            'session_description': local_description
                                        });
                                        console.log("Answer setLocalDescription succeeded");
                                    },
                                    function () {
                                        Alert("Answer setLocalDescription failed!");
                                    }
                                );
                            },
                            function (error) {
                                console.log("Error creating answer: ", error);
                                console.log(peer);
                            });
                    }
                },
                function (error) {
                    console.log("setRemoteDescription error: ", error);
                }
            );
            console.log("Description Object: ", desc);

        });

        /**
         * The offerer will send a number of ICE Candidate blobs to the answerer so they 
         * can begin trying to find the best path to one another on the net.
         */
        socket.on('iceCandidate', function (config) {
            var peer = peers[config.peer_id];
            var ice_candidate = config.ice_candidate;
            peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
        });


        /**
         * When a user leaves a channel (or is disconnected from the
         * signaling server) everyone will recieve a 'removePeer' message
         * telling them to trash the media channels they have open for those
         * that peer. If it was this client that left a channel, they'll also
         * receive the removePeers. If this client was disconnected, they
         * wont receive removePeers, but rather the
         * socket.on('disconnect') code will kick in and tear down
         * all the peer sessions.
         */
        socket.on('removePeer', function (config) {
            console.log('Signaling server said to remove peer:', config);
            var peer_id = config.peer_id;
            if (peer_id in peer_media_elements) {
                peer_media_elements[peer_id].remove();
            }
            if (peer_id in peers) {
                peers[peer_id].close();
            }

            delete peers[peer_id];
            delete peer_media_elements[config.peer_id];
        });
    }




    /***********************/
    /** Local media stuff **/
    /***********************/
    function setup_local_media(callback, errorback) {
        if (local_media_stream != null) {
            /* ie, if we've already been initialized */
            if (callback) callback();
            return;
        }
        /* Ask user for permission to use the computers microphone and/or camera, 
         * attach it to an <audio> or <video> tag if they give us access. */
        console.log("Requesting access to local audio / video inputs");

        attachMediaStream = function (element, stream) {
            console.log('DEPRECATED, attachMediaStream will soon be removed.');
            element.srcObject = stream;
        };


        navigator.mediaDevices.getUserMedia({
                video: USE_VIDEO,
                audio: USE_AUDIO
            })
            .then(stream => {
                /* user accepted access to a/v */
                console.log("Access granted to audio/video");
                local_media_stream = stream;
                var local_media = USE_VIDEO ? $("<video>") : $("<audio>");
                local_media.attr("autoplay", "autoplay");
                local_media.attr("muted", "true"); /* always mute ourselves by default */
                local_media.attr("controls", "");
                $('#channel-list').append(local_media);
                attachMediaStream(local_media[0], stream);

                if (callback) callback();
            })
            .catch(error => {
                console.log(error);
                if (errorback) errorback();
            });

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
    reader.onload = function () {
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
    var blob = new Blob([ab], {
        type: mimeString
    });
    return blob;

}