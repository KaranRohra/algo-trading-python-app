import time
from datetime import datetime as dt
from datetime import timedelta as td

from mongodb.users import User, Strategy, HOLDING_DIRECTION, EntryExitInstrument
from mongodb.connection import users as user_collection
from logs import log
from strategies import entry, exit
from utils import constants as const
from utils.common import get_candle_limit


def place_entry_order(
    user: User, strategy: Strategy, ohlc: dict, transaction_type: str
):
    broker = user.broker
    curr_ohlc, entry_price = ohlc, None
    entry_instrument = strategy["entry_instrument"]
    while len(curr_ohlc) - len(ohlc) < 4:
        now = dt.now()
        curr_ohlc = user.broker.historical_data(
            entry_instrument,
            from_date=ohlc[0]["date"],
            to_date=now,
            interval=entry_instrument["timeframe"],
        )
        if transaction_type == const.BUY and curr_ohlc[-1]["high"] > ohlc[-1]["high"]:
            entry_price = curr_ohlc[-1]["close"]
            break
        if transaction_type == const.SELL and curr_ohlc[-1]["low"] < ohlc[-1]["low"]:
            entry_price = curr_ohlc[-1]["close"]
            break
        time.sleep(1)

    if not entry_price:
        log.warn(
            f"Order failed - [{user.user_id} - {entry_instrument['tradingsymbol']}]",
            {"status": "Candle High/Low not break", **user.to_dict()},
        )
        return
    for trade_instrument in strategy["trade_instruments"]:
        now = dt.now()
        ohlc = user.broker.historical_data(
            trade_instrument,
            from_date=now - td(days=5),
            to_date=now,
            interval="day",
        )
        instrument_transaction_type = (
            transaction_type
            if trade_instrument["transaction_type"] == "BOTH"
            else trade_instrument["transaction_type"]
        )
        if instrument_transaction_type == const.BUY:
            entry_price = ohlc[-1]["close"] * 1.02
        else:
            entry_price = ohlc[-1]["close"] * 0.98
        entry_price = round(round(entry_price / 0.05) * 0.05, 2)
        broker.place_order(
            instrument_token=trade_instrument["instrument_token"],
            tradingsymbol=trade_instrument["tradingsymbol"],
            exchange=trade_instrument["exchange"],
            product=trade_instrument["product"],
            variety=broker.VARIETY_REGULAR,
            transaction_type=instrument_transaction_type,
            quantity=abs(trade_instrument["quantity"]),
            order_type=broker.ORDER_TYPE_LIMIT,
            price=entry_price,
            validity=broker.VALIDITY_DAY,
        )
    log.success(
        f"Entry order placed successfully - {user.user_id} - {entry_instrument['tradingsymbol']}"
    )


def entry_order(user: User, strategy: Strategy):
    now = (dt.now() - td(minutes=1)).replace(second=59)
    entry_instrument = strategy["entry_instrument"]
    ohlc = user.broker.historical_data(
        entry_instrument,
        from_date=now - td(days=get_candle_limit(entry_instrument["timeframe"])),
        to_date=now,
        interval=entry_instrument["timeframe"],
    )
    result = entry.ema_adx_rsi_entry_v2(ohlc)
    log.info(
        f"Entry Signal: {user.user_id} - {entry_instrument['tradingsymbol']}",
        result,
    )
    if result["signal"] not in strategy["trade_on_signal"] or not result["signal"]:
        return

    place_entry_order(user, strategy, ohlc, result["signal"])
    exit_signal = get_exit_signal(user, strategy["exit_instrument"])
    strategy["holding_direction"] = exit_signal["signal"]
    user_collection.update_one(
        {"user_id": user.user_id},
        {"$set": {"strategies": user.strategies}},
    )


def get_exit_signal(user: User, exit_instrument: EntryExitInstrument):
    now = (dt.now() - td(minutes=1)).replace(second=59)
    ohlc = user.broker.historical_data(
        exit_instrument,
        from_date=now - td(days=get_candle_limit(exit_instrument["timeframe"])),
        to_date=now,
        interval=exit_instrument["timeframe"],
    )

    return exit.ema_exit_v2(ohlc)


def exit_order(user: User, strategy: Strategy):
    broker = user.broker
    exit_instrument = strategy["exit_instrument"]
    result = get_exit_signal(user, exit_instrument)
    log.info(
        f"Exit Signal: {user.user_id} - {exit_instrument['tradingsymbol']}",
        result,
    )
    if (
        result["signal"] == const.BUY
        and strategy["holding_direction"] == HOLDING_DIRECTION.LONG
    ):
        return
    elif (
        result["signal"] == const.SELL
        and strategy["holding_direction"] == HOLDING_DIRECTION.SHORT
    ):
        return

    for trade_instrument in strategy["trade_instruments"]:
        broker.place_order(
            instrument_token=trade_instrument["instrument_token"],
            tradingsymbol=trade_instrument["tradingsymbol"],
            exchange=trade_instrument["exchange"],
            product=trade_instrument["product"],
            variety=broker.VARIETY_REGULAR,
            transaction_type=(
                const.SELL
                if trade_instrument["transaction_type"] == const.BUY
                else const.BUY
            ),
            quantity=abs(trade_instrument["quantity"]),
            order_type=broker.ORDER_TYPE_MARKET,
            validity=broker.VALIDITY_DAY,
            price=0,
        )
    log.success(
        f"Exit order placed successfully - {user.user_id} - {exit_instrument['tradingsymbol']}"
    )
    strategy["holding_direction"] = HOLDING_DIRECTION.NA
    user_collection.update_one(
        {"user_id": user.user_id},
        {"$set": {"strategies": user.strategies}},
    )
