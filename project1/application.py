import os
import requests
import json

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
    return render_template("search.html", username=session["user_name"], resulterror=request.args.get('resulterror'))

@app.route("/signout")
def signout():
    session["user_id"] = "";
    return redirect(url_for('login', error="Signed out!"))

@app.route("/results", methods=["POST"])
def results():
    requestInfo = request.form.get("searchquery")
    print(f"Client requested: {requestInfo}")
    databaseSelection = db.execute("SELECT * FROM books WHERE UPPER(title) LIKE UPPER(:title) OR UPPER(isbn) LIKE UPPER(:isbn) OR UPPER(author) LIKE UPPER(:author) OR CAST(year AS TEXT) LIKE :year", {"title":"%" + requestInfo + "%", "isbn":"%" + requestInfo + "%", "author":"%" + requestInfo + "%", "year": "%" + str(requestInfo) + "%"}).fetchall()
    for selection in databaseSelection:
        print(selection.author)
    if not databaseSelection:
        return redirect(url_for('search', resulterror = "No results or incorrect query!"))
    return render_template("results.html", databaseSelection=databaseSelection)

@app.route("/books/<int:book_id>", methods=["GET","POST"])
def books(book_id):
    alreadySubmit = False # must be assigned to not throw UnboundLocalError
    if request.method == "POST":
        # checks if form actually filled out the rating which is required
        if request.form.get("rating"):
            #Checks if user has posted before
            testInstance = db.execute("SELECT * from reviews WHERE bookid=:bookid AND userid=:userid",{"bookid":book_id, "userid":session["user_id"]}).fetchone()
            if testInstance is None:
                db.execute("INSERT INTO reviews (userid, username, bookid, rating, reviewtext) VALUES (:userid, :username, :bookid, :rating, :reviewtext)", {"userid":session["user_id"], "username":session["user_name"], "bookid":book_id, "rating":request.form.get("rating"), "reviewtext":request.form.get("reviewtext")})
                db.commit()
            else:
                alreadySubmit = True #does this so it can properly fetch all the reviews to hand off to the new render with the error message
    #makes sure the book exists
    book = db.execute("SELECT * FROM books WHERE id=:id", {"id":book_id}).fetchone()
    #gets goodreads data
    res = requests.get("https://www.goodreads.com/book/review_counts.json", params={"key": "RjXynCfMsw5WR5nJDdnUw", "isbns": book.isbn}).json()['books'][0] #turns response into json data, dict
    # loadedres = json.loads(res)[0] #converts json string to dictionary
    print(f"The type is: {type(res)}")
    print(res)
    # print(res[0]['id'])
    if book is None:
        return render_template("error.html", error="No book found of that ID")
    reviews = db.execute("SELECT * FROM reviews WHERE bookid=:id", {"id":book_id}).fetchall()
    if alreadySubmit:
        return render_template("bookinfo.html", book=book, reviews=reviews, goodreads=res, reviewerror="You have already submitted a review!")
    return render_template("bookinfo.html", book=book, reviews=reviews, goodreads=res)