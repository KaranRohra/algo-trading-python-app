import json
import time
from datetime import datetime
from os import environ
from typing import List, TypedDict

import pyotp

from brokers import angelone_smart_api, kite_connect
from logs import log
from mongodb import connection as mongo_connection
from utils.common import time_str_to_curr_datetime
from utils.constants import Broker, Env
from enum import Enum


class Instrument(TypedDict):
    tradingsymbol: str
    instrument_token: str
    exchange: str


class TradeInstrument(Instrument):
    product: str
    quantity: int
    transaction_type: str


class EntryExitInstrument(Instrument):
    timeframe: str


class TRANSACTION_TYPE(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    BOTH = "BOTH"


class HOLDING_DIRECTION(str, Enum):
    LONG = "BUY"
    SHORT = "SELL"
    NA = "NA"


class Strategy(TypedDict):
    entry_instrument: EntryExitInstrument
    exit_instrument: EntryExitInstrument
    trade_instruments: List[TradeInstrument]
    holding_direction: HOLDING_DIRECTION
    active: bool
    trade_on_signal: List[TRANSACTION_TYPE]


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
        strategies: List[Strategy],
        risk_amount,
        broker_name,
        in_process_symbols=set(),
        api_key=None,
        priority=0,
        **kwargs,
    ):
        self.user_name: str = user_name
        self.user_id: str = user_id
        self._password: str = password
        self._two_fa: str = two_fa
        self.active: bool = active
        self.start_time: datetime = time_str_to_curr_datetime(start_time)
        self.end_time: datetime = time_str_to_curr_datetime(end_time)
        self.strategies: List[Strategy] = strategies
        self.in_process_symbols: set = in_process_symbols
        self.risk_amount: int = int(risk_amount)
        self.broker_name: str = broker_name
        self.api_key: str = api_key
        self.priority: int = int(priority)

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

    def to_dict(self):
        return {
            "user_name": self.user_name,
            "user_id": self.user_id,
            "active": self.active,
            "broker": self.broker_name,
            "start_time": self.start_time.isoformat(),  # Convert datetime to ISO 8601 string
            "end_time": self.end_time.isoformat(),  # Convert datetime to ISO 8601 string
        }

    def __str__(self) -> str:
        """
        Returns a string representation of the object.
        """
        return (
            "{"
            + f"User ID: {self.user_id}, Status: {self.active}, Start Time: {self.start_time}, End Time: {self.end_time}, Risk Amount: {self.risk_amount}"
            + "}"
        )


def get_or_update_users(old_users: List[User] | None = None) -> List[User]:
    """Returns a list of users from the google sheet."""
    users = list(mongo_connection.users.find())
    users_secrets = json.loads(environ.get(Env.USERS_SECRETS))
    new_users: List[User] = []

    for i in range(len(users)):
        user_secrets = users_secrets.get(users[i]["user_id"])
        if not user_secrets:
            log.error(f"User {users[i]['user_id']} not found in secrets")
            continue
        user_obj = User(**users[i], **user_secrets)
        if old_users:
            user_obj.broker = old_users[i].broker
            old_users[i] = user_obj
        else:
            user_obj.set_broker_obj()
        new_users.append(user_obj)

    return old_users or new_users


def get_broker_obj(broker_name):
    return {
        Broker.ZERODHA: kite_connect.KiteConnect,
        Broker.ANGELONE: angelone_smart_api.AngelOneSmartConnect,
    }[broker_name]
