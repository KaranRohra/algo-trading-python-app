import os
import json
from datetime import timedelta

from bson.objectid import ObjectId
from dotenv import load_dotenv
from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_bcrypt import Bcrypt
from pymongo import MongoClient

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
bcrypt = Bcrypt(app)

# MongoDB connection
client = MongoClient(os.environ["MONGO_URI"])  # Connect to MongoDB
db = client[os.environ["MONGO_DB"]]  # Connect to the "dev" database
users_collection = db["users"]  # Collection for users
logs_collection = db["logs"]  # Collection for logs
env_collection = db["environment"]  # Collection for key-value pairs

# Admin login credentials from environment variables
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD_HASH = bcrypt.generate_password_hash(os.getenv("ADMIN_PASSWORD")).decode(
    "utf-8"
)


# User session management
@app.before_request
def require_login():
    if request.endpoint not in ["login", "static"] and "user" not in session:
        return redirect(url_for("login"))


# Routes


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        if email == ADMIN_EMAIL and bcrypt.check_password_hash(
            ADMIN_PASSWORD_HASH, password
        ):
            session["user"] = email
            return redirect(url_for("user_list"))
        else:
            flash("Invalid credentials", "error")
            return redirect(url_for("login"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))


@app.route("/users")
def user_list():
    users = list(users_collection.find())
    return render_template("users.html", users=users)


@app.route("/users/edit/<id>", methods=["GET", "POST"])
def edit_user(id):
    if request.method == "GET":
        user = users_collection.find_one({"_id": ObjectId(id)})
        return render_template("edit_user.html", user=user)
    new_data = {
        "user_name": request.form["user_name"],
        "active": '1' if request.form.get("active") else '0',
        "user_id": request.form["user_id"],
        "start_time": request.form["start_time"],
        "end_time": request.form["end_time"],
        "risk_amount": request.form["risk_amount"],
        "broker_name": request.form["broker_name"],
        "basket": request.form["basket"],
        "entry_time_frame": request.form["entry_time_frame"],
        "exit_time_frame": request.form["exit_time_frame"],
        "priority": request.form["priority"]
    }
    users_collection.update_one({"_id": ObjectId(id)}, {"$set": new_data})
    flash("User updated successfully", "success")
    return redirect(url_for('edit_user', id=id))


@app.route("/env", methods=["GET", "POST"])
def environment():
    if request.method == "POST":
        key = request.form["key"]
        value = request.form["value"]
        env_collection.update_one({}, {"$set": {key: value}}, upsert=True)
        flash("Environment variable updated", "success")
    env_vars = env_collection.find_one() or {}
    env_vars.pop("_id", None)
    return render_template("env.html", env_vars=env_vars)


@app.route("/env/delete", methods=["POST"])
def delete_environment():
    key = request.form["key"]
    env_collection.update_one({}, {"$unset": {key: ""}})
    flash("Environment variable deleted", "success")
    return redirect(url_for("environment"))


@app.route("/logs")
def logs():
    page = request.args.get("page", 1, type=int)
    per_page = 20
    total_logs = logs_collection.count_documents({})
    total_pages = (total_logs + per_page - 1) // per_page  # Calculate total pages

    logs = (
        logs_collection.find()
        .sort("timestamp", -1)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )

    # Convert timestamp to string
    log_entries = []
    for log in logs:
        if log.get("details"):
            if log["details"].get("date"):
                log["details"]["date"] = str(
                    log["details"]["date"] + timedelta(hours=5, minutes=30)
                )
            log['details'] = json.dumps(log['details'])
        log_entries.append(log)

    return render_template(
        "logs.html",
        logs=log_entries,
        page=page,
        total_pages=total_pages,
    )


# Helper to add log entries
def add_log(log_type, message):
    logs_collection.insert_one({"type": log_type, "message": message})


@app.route("/")
def home():
    return redirect(url_for("user_list"))


if __name__ == "__main__":
    app.run(debug=True)
