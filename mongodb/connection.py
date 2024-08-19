from datetime import datetime as dt
from os import environ

import pymongo

from utils.constants import Env

_client = pymongo.MongoClient(environ[Env.MONGO_URI])
_db = _client[environ[Env.MONGO_DB]]
trades = _db["trades"]
holdings = _db["holdings"]
logs = _db["logs"]


def insert_log(log_type, message, details=None):
    logs.insert_one(
        {
            "timestamp": str(dt.now()),
            "logType": log_type,
            "message": message,
            "details": details,
        }
    )
