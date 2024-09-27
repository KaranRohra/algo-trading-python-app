import time
from datetime import datetime as dt
from threading import Thread
from typing import List

import schedule

from logs import log
from mongodb.environ import GOOGLE_SHEET_ENVIRON
from mongodb.users import User, get_or_update_users
from oms import user_scan


def set_db_data(users: List[User]):
    get_or_update_users(users)
    GOOGLE_SHEET_ENVIRON.set_environ()


def scan_users(users: List[User]):
    for user in users:
        Thread(
            target=user_scan.scan_user_basket,
            args=(user,),
            name=f"[{dt.now()}] [{user.user_id}]",
        ).start()


def is_trading_time() -> bool:
    now = dt.now()
    return GOOGLE_SHEET_ENVIRON.start_time <= now <= GOOGLE_SHEET_ENVIRON.end_time and (
        not GOOGLE_SHEET_ENVIRON.force_stop
    )


def start():
    log.clean_logs_older_than_30()
    while True:
        try:
            GOOGLE_SHEET_ENVIRON.set_environ()
            users = get_or_update_users()
            schedule.every().minute.at(":30").do(set_db_data, users)
            schedule.every().minute.at(":00").do(scan_users, users)
            while is_trading_time():
                schedule.run_pending()
                time.sleep(1)
            break
        except Exception as e:
            for user in users:
                user.broker.logout()
            log.error(e)
            time.sleep(20)

    log.warn("Trading Stopped.")
