from datetime import datetime as dt
from threading import Thread

from mongodb.users import User
from logs import log
from oms import orders
from utils import common


def search_trade(user: User, symbol, trade_func):
    token = symbol["instrument_token"]
    user.in_process_symbols.add(token)
    try:
        trade_func(user, symbol)
    except Exception as e:
        log.error(
            e,
            f"{user.user_id} - {symbol['exchange']}:{symbol['tradingsymbol']} - {str(e)}",
        )
    finally:
        user.in_process_symbols.discard(token)


def scan_user_basket_without_handling_error(user: User):
    now = dt.now()
    if not user.active:
        return

    if now < user.start_time or now > user.end_time:
        return

    entry_time_frame = common.get_int_time_frame_from_str(user.entry_time_frame)
    exit_time_frame = common.get_int_time_frame_from_str(user.exit_time_frame)

    user.set_holdings()
    for s in user.broker.basket(user.basket):
        if s["instrument_token"] in user.in_process_symbols:
            continue
        holding = [
            h for h in user.holdings if h["instrument_token"] == s["instrument_token"]
        ]
        trade_func = None
        if holding:
            if now.minute % exit_time_frame == 0:  # Check is perfect time to exit
                trade_func = orders.exit_order
        elif now.minute % entry_time_frame == 0:  # Check is perfect time to enter
            trade_func = orders.entry_order

        if trade_func:
            Thread(
                target=search_trade,
                args=(user, s, trade_func),
                name=f"[{dt.now()}] [{user.user_id}] [{s['exchange']}:{s['tradingsymbol']}]: {trade_func.__name__}",
            ).start()


def scan_user_basket(user: User):
    try:
        scan_user_basket_without_handling_error(user)
    except Exception as e:
        log.error(e, f"{user.user_id} - {str(e)}")
        user.broker.logout()
        user.set_broker_obj()
