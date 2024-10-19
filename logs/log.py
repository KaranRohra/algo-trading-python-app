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
    threshold_date = dt.now() - td(days=5)
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
        info(
            f"Deleted {delete_result.deleted_count} documents older than {threshold_date} or without a timestamp."
        )
    else:
        info("No documents older than 5 days to delete.")


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
