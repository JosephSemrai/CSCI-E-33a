import os
import time

from collections import OrderedDict
from flask import Flask, session, request, render_template, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

class Channel:
    def __init__(self, name):
        self.name = name
        self.messages = []

    def newMessage(self, user, content, time):
        message = {"content": content, "user": user, "time":time}
        self.messages.append(message)
        #deletes messages past the past 100
        while len(self.messages) > 100:
            del(self.messages[0])


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
channels = OrderedDict()

@app.route("/")
def index():
    return render_template("main.html", channels=channels)


@app.route("/fetchChannel", methods=["POST"])
def fetchChannel():
    requestedChannel = request.form.get("channelName")
    print(channels[requestedChannel].messages)
    return jsonify({"success": True, "messages": channels[requestedChannel].messages})

@socketio.on("create channel")
def createChannel(data):
    channelName = data["channelname"]
    newChannel = Channel(channelName)
    channels[channelName] = newChannel;
    print(f"Added channel {channelName}")
    updateChannels()
    
def updateChannels():
    returnChannel = []
    for channel in channels.values():
        returnChannel.append(channel.name)
    emit("all channels", {"success": True, "channels": returnChannel}, broadcast=True)

@socketio.on("new message")
def newMessage(data):
    messageChannel = data["channel"]
    messageContent = data["content"]
    messageUser = data["user"]
    messageTime = data["time"]
    channels[messageChannel].newMessage(user=messageUser, content=messageContent, time=messageTime)
    emit("chat update", channels[messageChannel].messages[-1], broadcast=True)



if __name__ == '__main__':
    socketio.run(app)

