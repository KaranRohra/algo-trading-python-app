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
users = _db["users"]
environments = _db["environment"]


def insert_log(log_type, message, details=None):
    print(f"[{dt.now()}] [{log_type}] [{message}]")
    logs.insert_one(
        {
            "timestamp": str(dt.now()),
            "logType": log_type,
            "message": message,
            "details": details,
        }
    )


def clean_logs():
    threshold_date = dt.utcnow() - td(days=30)
    ids_to_delete = []

    documents_to_delete = logs.find()

    for doc in documents_to_delete:
        try:
            if "timestamp" in doc and doc["timestamp"]:
                timestamp_str = doc["timestamp"].split(".")[0]
                doc_timestamp = dt.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")

                if doc_timestamp < threshold_date:
                    ids_to_delete.append(doc["_id"])
            else:
                ids_to_delete.append(doc["_id"])
        except ValueError:
            print(f"Invalid timestamp format in document with _id: {doc['_id']}")

    if ids_to_delete:
        delete_result = logs.delete_many({"_id": {"$in": ids_to_delete}})
        log.info(
            f"Deleted {delete_result.deleted_count} documents older than {threshold_date} or without a timestamp."
        )
    else:
        log.info("No documents older than 30 days to delete.")
