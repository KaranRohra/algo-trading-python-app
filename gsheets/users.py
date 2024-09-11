import time
from datetime import datetime
from typing import List

import pyotp
from gspread.exceptions import GSpreadException

from brokers import kite_connect, angelone_smart_api
from gsheets import connection
from logs import log
from utils.common import time_str_to_curr_datetime, title_to_snake
from utils.constants import Broker, SheetIndex


class User:
    def __init__(
        self,
        user_name,
        user_id,
        password,
        two_fa,
        active,
        start_time,
        end_time,
        basket,
        risk_amount,
        broker_name,
        entry_time_frame,
        exit_time_frame,
        in_process_symbols=set(),
        holdings=[],
        api_key=None,
    ):
        self.user_name: str = user_name
        self.user_id: str = user_id
        self._password: str = password
        self._two_fa: str = two_fa
        self.active: bool = active == "1"
        self.start_time: datetime = time_str_to_curr_datetime(start_time)
        self.end_time: datetime = time_str_to_curr_datetime(end_time)
        self.basket: str = basket
        self.in_process_symbols: set = in_process_symbols
        self.risk_amount: int = int(risk_amount)
        self.broker_name: str = broker_name
        self.entry_time_frame: str = entry_time_frame
        self.exit_time_frame: str = exit_time_frame
        self.holdings: List[dict] = holdings
        self.api_key: str = api_key

    def set_broker_obj(self):
        retry = 0
        while retry < 3:  # Max retry connection 3 times
            try:
                self.broker: (
                    kite_connect.KiteConnect | angelone_smart_api.AngelOneSmartConnect
                ) = get_broker_obj(self.broker_name)(
                    user_id=self.user_id,
                    password=self._password,
                    totp_value=pyotp.TOTP(self._two_fa).now(),
                    api_key=self.api_key,
                )
                log.success(f"{self.user_id}: Connection with Broker Established")
                break
            except Exception as e:
                retry += 1
                log.error(e, f"{self.user_id}: {self.user_name} - Connection Failed")
                time.sleep(5)

    def set_holdings(self):
        self.holdings = [h for h in self.broker.holdings() if h["quantity"] != 0]
        positions = [p for p in self.broker.positions()["net"] if p["quantity"] != 0]
        self.holdings.extend(positions)

    def to_dict(self):
        return {
            "user_name": self.user_name,
            "user_id": self.user_id,
            "active": self.active,
            "broker": self.broker_name,
            "start_time": self.start_time.isoformat(),  # Convert datetime to ISO 8601 string
            "end_time": self.end_time.isoformat(),  # Convert datetime to ISO 8601 string
            "basket": self.basket,
        }

    def __str__(self) -> str:
        """
        Returns a string representation of the object.
        """
        return (
            "{"
            + f"User ID: {self.user_id}, Status: {self.active}, Start Time: {self.start_time}, End Time: {self.end_time}, Basket: {self.basket}, Risk Amount: {self.risk_amount}"
            + "}"
        )


def get_or_update_users(old_users: List[User] | None = None) -> List[User]:
    """Returns a list of users from the google sheet."""
    try:
        worksheet = connection.get_sheet().get_worksheet(SheetIndex.USER)
        values = worksheet.get_all_values()
        headers = [title_to_snake(h) for h in values[0]]

        users: List[User] = []
        for i in range(1, len(values)):
            # Row is incomplete, some values are missing
            if len(values[i]) != len(headers):
                continue
            user = {}
            for j in range(len(headers)):
                user[headers[j]] = values[i][j]

            user_obj = User(**user)
            if old_users:
                user_obj.broker = old_users[i - 1].broker
                old_users[i - 1] = user_obj
            else:
                user_obj.set_broker_obj()
                users.append(user_obj)

        return old_users or users
    except GSpreadException as e:
        log.error(e)
        return old_users or []


def get_broker_obj(broker_name):
    return {
        Broker.ZERODHA: kite_connect.KiteConnect,
        Broker.ANGELONE: angelone_smart_api.AngelOneSmartConnect,
    }[broker_name]
