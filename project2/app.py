import os

from collections import OrderedDict
from flask import Flask, session, request, render_template, redirect, url_for, jsonify, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, login_user, login_required, logout_user

# import table definitions
from models import *

usersList = []

app = Flask(__name__)
app.config["SECRET_KEY"] = "bgsdguhwguwr"
socketio = SocketIO(app)
channels = OrderedDict()

# database setup
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

 # Link the Flask app with the database (no Flask app is actually being run yet).
db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in the query for the user
    return User.query.get(int(user_id))


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

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login", methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        # check if user actually exists
        # take the user supplied password, hash it, and compare it to the hashed password in database
        if not user or not check_password_hash(user.password, password): 
            flash('Please check your login details and try again.')
            return redirect(url_for('login')) # if user doesn't exist or password is wrong, reload the page

        # if the above check passes, then we know the user has the right credentials
        login_user(user, remember=True)
        return redirect(url_for('main'))
    if request.method == 'GET':
        return render_template("login.html")
   

@app.route('/signup', methods=['GET','POST'])
def signup():
    if request.method == 'GET':
        return render_template("signup.html")
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first() # if this returns a user, then the username already exists in database

        if user: # if a user is found, we want to redirect back to signup page so user can try again
            flash('Username taken')
            return redirect(url_for('signup'))

        # create new user with the form data. Hash the password so plaintext version isn't saved.
        new_user = User(username=username, password=generate_password_hash(password, method='sha256'))

        # add the new user to the database
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route("/main", methods=["GET","POST"])
@login_required
def main():
    if request.method == "POST":
        requestedUsername = request.form.get("usernameInput")
        if requestedUsername in usersList:
            return render_template("index.html", error="Username already exists!")
        session["username"] = requestedUsername
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

def run():
    # Create tables based on each table definition in `models`
    print("MAIN EXECUTED")
    db.create_all()
    socketio.run(app)

if __name__ == '__main__':
    with app.app_context():
          run()



