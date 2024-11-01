import traceback
from datetime import datetime as dt, timedelta as td
from mongodb.connection import logs


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
    logs_count = logs.count_documents({})
    if logs_count <= 100:
        info("No logs to delete, total logs count is within the limit.")
        return

    logs_to_delete_count = logs_count - 100
    ids_to_delete = []

    documents_to_delete = logs.find().sort("timestamp", 1).limit(logs_to_delete_count)

    for doc in documents_to_delete:
        ids_to_delete.append(doc["_id"])

    if ids_to_delete:
        delete_result = logs.delete_many({"_id": {"$in": ids_to_delete}})
        info(
            f"Deleted {delete_result.deleted_count} documents to keep the latest 100 logs."
        )
    else:
        info("No documents to delete.")


def success(msg, details=None):
    insert_log("SUCCESS", msg, details)


def error(err, msg: str = ""):
    traceback_details = traceback.format_exc()
    insert_log(
        "ERROR",
        f"{type(err).__name__}: {str(err)}",
        {"message": msg, "error": str(err), "details": traceback_details},
    )


def info(msg, details=None):
    insert_log("INFO", msg, details)


def warn(msg, details=None):
    insert_log("WARN", msg, details)


def clean_logs_older_than_30():
    clean_logs()
