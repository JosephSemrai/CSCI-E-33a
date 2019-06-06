import os

from flask import Flask, session, request, render_template, redirect, url_for
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    #Creates user table
    return render_template("index.html")

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        username = request.form.get("name")
        password = request.form.get("password") 
        if db.execute("SELECT * FROM users WHERE username=:username",{"username": username}).rowcount != 0:
            return render_template("login.html", error="Username already exits")
        else:
            db.execute("INSERT INTO users (username, password) VALUES (:username, :password)", {"username":username,"password":password})
            print(f"ALERT: Added {username} with the password {password}")
            db.commit()
            return render_template("login.html")
    if request.method == "GET":
        if request.args.get('error') is None:
            return render_template("login.html")
        return render_template("login.html", error=request.args.get('error'))

@app.route("/home", methods=["GET","POST"])
def home():
    if request.method == "GET":
        if session.get("user_id") is None:
            return redirect(url_for('login', error="Redirect, you are not signed in!"))
        return render_template("home.html", username=session["user_name"])
    username = request.form.get("name")
    password = request.form.get("password")
    databaseUser = db.execute("SELECT * FROM users WHERE username=:username", {"username": username}).fetchone()
    if databaseUser is None:
        return redirect(url_for('login', error="Username does not exist!"))
    print(f"Database Password: {databaseUser.password}")
    print(f"Form Request Password: {password}")
    if databaseUser.password == password:
        session["user_id"] = databaseUser.id
        session["user_name"] = databaseUser.username
        return render_template("home.html", username=username)
    else:
        return redirect(url_for('login', error="Incorrect Password!"))

@app.route("/search")
def search():
    if session.get("user_id") is None: #Used .get here to check if the value actually exists in the dictionary, otherwise, using the square bracket notation would access it and throw an error as there was nothing there
        return redirect(url_for('login', error="Redirect, you are not signed in!"))
    elif not isinstance(session.get("user_id"), int):
        return redirect(url_for('login', error="Redirect, you are not signed in or session ID blank!"))
    else:
        #Checks if the signed in id actually exists
        checkSign = db.execute("SELECT * FROM users WHERE id=:id", {"id": session["user_id"]}).fetchone()
        if checkSign is None:
            return redirect(url_for('login', error="Redirect, you are not signed in!"))
    return render_template("search.html", username=session["user_name"])


@app.route("/signout")
def signout():
    session["user_id"] = "";
    return redirect(url_for('login', error="Signed out!"))