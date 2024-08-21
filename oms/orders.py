import time
from datetime import datetime as dt
from datetime import timedelta as td

from gsheets.users import User
from logs import log
from strategies import entry, exit
from utils import constants as const
from utils.common import get_candle_limit


def place_entry_order(user: User, symbol: dict, ohlc: dict, transaction_type: str):
    broker = user.broker
    curr_ohlc, entry_price = ohlc, None
    while len(curr_ohlc) - len(ohlc) < 4:
        now = dt.now()
        curr_ohlc = user.broker.historical_data(
            symbol["instrument_token"],
            from_date=ohlc[0]["date"],
            to_date=now,
            interval=user.entry_time_frame,
        )
        if transaction_type == const.BUY and curr_ohlc[-1]["close"] > ohlc[-1]["high"]:
            entry_price = curr_ohlc[-1]["close"]
        if transaction_type == const.SELL and curr_ohlc[-1]["close"] < ohlc[-1]["low"]:
            entry_price = curr_ohlc[-1]["close"]
        time.sleep(1)

    if not entry_price:
        log.warn(
            f"Order failed - [{user.user_id} - {symbol['exchange']}:{symbol['tradingsymbol']}]",
            {"status": "Candle High/Low not break", **user.to_dict()},
        )
        return
    broker.place_order(
        tradingsymbol=symbol["tradingsymbol"],
        exchange=symbol["exchange"],
        product=symbol["params"]["product"],
        variety=broker.VARIETY_REGULAR,
        transaction_type=transaction_type,
        quantity=abs(symbol["params"]["quantity"]),
        order_type=broker.ORDER_TYPE_MARKET,
        validity=broker.VALIDITY_DAY,
    )
    log.success(
        f"Order placed successfully- [{user.user_id} - {symbol['exchange']}:{symbol['tradingsymbol']}]",
        {**user.to_dict()},
    )


def entry_order(user: User, symbol: dict):
    log.info(
        f"Searching entry for: {user.user_id} - {symbol['exchange']}:{symbol['tradingsymbol']}"
    )
    now = dt.now().replace(second=0)
    ohlc = user.broker.historical_data(
        symbol["instrument_token"],
        from_date=now - td(days=get_candle_limit(user.entry_time_frame)),
        to_date=now,
        interval=user.entry_time_frame,
    )
    result = entry.ema_adx_rsi_entry_v3(ohlc)
    if result["signal"] == const.BUY:
        place_entry_order(user, symbol, ohlc, user.broker.TRANSACTION_TYPE_BUY)
    elif result["signal"] == const.SELL:
        place_entry_order(user, symbol, ohlc, user.broker.TRANSACTION_TYPE_SELL)


def exit_order(user: User, symbol: dict):
    log.info(
        f"Searching exit for: {user.user_id} - {symbol['exchange']}:{symbol['tradingsymbol']}"
    )
    broker = user.broker
    holding = [
        h for h in user.holdings if h["instrument_token"] == symbol["instrument_token"]
    ][0]
    now = dt.now().replace(second=0)
    ohlc = user.broker.historical_data(
        symbol["instrument_token"],
        from_date=now - td(days=get_candle_limit(user.exit_time_frame)),
        to_date=now,
        interval=user.exit_time_frame,
    )

    result = exit.ema_exit_v1(ohlc)
    if result["signal"] == const.BUY and holding["quantity"] > 0:
        return
    elif result["signal"] == const.SELL and holding["quantity"] < 0:
        return

    order_id = broker.place_order(
        tradingsymbol=holding["tradingsymbol"],
        exchange=holding["exchange"],
        product=holding["product"],
        variety=broker.VARIETY_REGULAR,
        transaction_type=result["signal"],
        quantity=abs(holding["quantity"]),
        order_type=broker.ORDER_TYPE_MARKET,
        validity=broker.VALIDITY_DAY,
    )

    order = [o for o in broker.orders() if str(o["order_id"]) == str(order_id)][0]
    msg = f"{user.user_id} - {holding['exchange']}:{holding['tradingsymbol']}"
    if order["status"] == broker.STATUS_COMPLETE:
        log.success(f"Position exited successfully - {msg}")
    else:
        log.warn(f"Order failed to execute - {msg}")
