import os

from flask import Flask, session, request, render_template, redirect, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("main.html")

if __name__ == '__main__':
    socketio.run(app)



