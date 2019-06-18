document.addEventListener('DOMContentLoaded', () => {

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

            socket.emit('create channel', {'channelname' : document.querySelector('#create-channel-name').value});
            $('#channelModal').modal('hide');
            document.querySelector('#create-channel-name').value = "";
        };

    };
    





});