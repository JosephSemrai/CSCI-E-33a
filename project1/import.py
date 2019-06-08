import csv
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

engine = create_engine(os.getenv("DATABASE_URL")) # database engine object from SQLAlchemy that manages connections to the database
                                                # DATABASE_URL is an environment variable that indicates where the database lives
db = scoped_session(sessionmaker(bind=engine))    # create a 'scoped session' that ensures different users' interactions with the
                                                # database are kept separate
f = open("books.csv")
reader = csv.reader(f)
# TO CREATE USER TABLE
db.execute("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, password VARCHAR NOT NULL)")
# TO CREATE REVIEW TABLE
db.execute("CREATE TABLE reviews (id SERIAL PRIMARY KEY, userid INTEGER NOT NULL, username VARCHAR NOT NULL, bookid INTEGER NOT NULL, rating INTEGER NOT NULL, reviewtext VARCHAR)")
# TO CREATE BOOKS TABLE
db.execute("CREATE TABLE books (id SERIAL PRIMARY KEY, isbn VARCHAR NOT NULL, title VARCHAR NOT NULL, author VARCHAR NOT NULL, year INTEGER NOT NULL)")
for isbn,title,author,year in reader:
    db.execute("INSERT INTO books (isbn, title, author, year) VALUES (:isbn, :title, :author, :year)",
                  {"isbn": isbn, "title": title, "author": author, "year": int(year)})
    print(f"Added {title} by {author} ({year}) with ISBN - {isbn}")
db.commit()