from datetime import datetime as dt
from threading import Thread

from mongodb.users import User, HOLDING_DIRECTION
from logs import log
from oms import orders
from utils import common


def search_trade(user: User, strategyIndex: int, instrument_section: str, trade_func):
    strategy = user.strategies[strategyIndex]
    token = strategy[instrument_section]["instrument_token"]
    user.in_process_symbols.add(token)
    try:
        trade_func(user, strategy)
    except Exception as e:
        log.error(
            e,
            f"{user.user_id} - Strategy: {strategyIndex} - {instrument_section} - {str(e)}",
        )
    finally:
        user.in_process_symbols.discard(token)


def scan_user_basket_without_handling_error(user: User):
    now = dt.now()
    if not user.active:
        return

    if now < user.start_time or now > user.end_time:
        return

    for i in range(len(user.strategies)):
        s = user.strategies[i]
        if (
            s["entry_instrument"]["instrument_token"] in user.in_process_symbols
            or not s["active"]
        ):
            continue
        entry_time_frame = common.get_int_time_frame_from_str(
            s["entry_instrument"]["timeframe"]
        )
        exit_time_frame = common.get_int_time_frame_from_str(
            s["exit_instrument"]["timeframe"]
        )
        trade_func, instrument_section = None, ""
        if s["holding_direction"] == HOLDING_DIRECTION.NA:
            if now.minute % entry_time_frame == 0:
                trade_func = orders.entry_order
                instrument_section = "entry_instrument"
        elif now.minute % exit_time_frame == 0:
            trade_func = orders.exit_order
            instrument_section = "exit_instrument"

        if trade_func:
            Thread(
                target=search_trade,
                args=(user, i, instrument_section, trade_func),
                name=f"[{dt.now()}] [{user.user_id}] [Strategy - {i}]: {trade_func.__name__}",
            ).start()


def scan_user_basket(user: User):
    try:
        scan_user_basket_without_handling_error(user)
    except Exception as e:
        log.error(e, f"{user.user_id} - {str(e)}")
        user.broker.logout()
        user.set_broker_obj()
