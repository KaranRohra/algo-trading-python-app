import time
from datetime import datetime as dt
from threading import Thread
from typing import List

import schedule

from logs import log
from mongodb.environ import Environ
from mongodb.users import User, get_or_update_users
from oms import user_scan


def set_db_data(users: List[User]):
    get_or_update_users(users)
    Environ.set_environ()


def scan_users(users: List[User]):
    for user in sorted(users, key=lambda x: x.priority, reverse=True):
        Thread(
            target=user_scan.scan_user_basket,
            args=(user,),
            name=f"[{dt.now()}] [{user.user_id}]",
        ).start()


def is_trading_time() -> bool:
    now = dt.now()
    return Environ.start_time <= now <= Environ.end_time and (not Environ.force_stop)


def start():
    log.clean_logs_older_than_30()
    while True:
        try:
            Environ.set_environ()
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
