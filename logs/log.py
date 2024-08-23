import traceback

from mongodb import connection as db_conn


def success(msg, details=None):
    db_conn.insert_log("SUCCESS", msg, details)


def error(err, msg: str = ""):
    traceback_details = traceback.format_exc()
    db_conn.insert_log(
        "ERROR",
        f"{type(err).__name__}: {str(err)}",
        {"message": msg, "error": str(err), "details": traceback_details},
    )


def info(msg, details=None):
    db_conn.insert_log("INFO", msg, details)


def warn(msg, details=None):
    db_conn.insert_log("WARN", msg, details)


def clean_logs_older_than_30():
    db_conn.clean_logs()
