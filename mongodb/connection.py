from datetime import datetime as dt, timedelta as td
from os import environ

import pymongo

from utils.constants import Env
from logs import log

_client = pymongo.MongoClient(environ[Env.MONGO_URI])
_db = _client[environ[Env.MONGO_DB]]
trades = _db["trades"]
holdings = _db["holdings"]
logs = _db["logs"]


def insert_log(log_type, message, details=None):
    print(f"[{dt.now()}] [{log_type}] [{message}] - [{details}]")
    logs.insert_one(
        {
            "timestamp": str(dt.now()),
            "logType": log_type,
            "message": message,
            "details": details,
        }
    )


def clean_logs():
    # Calculate the date 30 days ago from today
    thirty_days_ago = dt.now() - td(days=30)

    # Delete documents older than 30 days
    result = logs.delete_many({"timestamp": {"$lt": thirty_days_ago}})

    log.success(
        "MongoDB",
        f"Deleted {result.deleted_count} documents older than 30 days.",
    )
