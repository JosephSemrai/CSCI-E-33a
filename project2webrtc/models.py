from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils import UUIDType
from flask_login import UserMixin
from flask_login import LoginManager, login_user
db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    uuid = db.Column(UUIDType(binary=False), unique=True, nullable=False)
    # status = db.Column(db.String(100))
    