import time
from os import environ
from datetime import datetime as dt
from datetime import timedelta as td

from mongodb.users import User, Strategy, HOLDING_DIRECTION
from mongodb.connection import users as user_collection
from logs import log
from utils import constants as const


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
        time.sleep(0.4)

    if not entry_price:
        log.warn(
            f"Order failed - [{user.user_id} - {entry_instrument['tradingsymbol']}]",
            {"status": "Candle High/Low not break", **user.to_dict()},
        )
        return
    # Sorted on transaction_type to buy first
    trade_instruments = sorted(strategy["trade_instruments"], key=lambda x: x["transaction_type"])
    for trade_instrument in trade_instruments:
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
            entry_price = ohlc[-1]["close"] * 1.002
        else:
            entry_price = ohlc[-1]["close"] * 0.998
        entry_price = round(round(entry_price / 0.05) * 0.05, 2)
        if environ.get(const.Env.MOCK_TRADING):
            continue
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
    entry_instrument = strategy["entry_instrument"]
    signal_details = const.CACHE_ENTRY_SIGNAL_DETAIL[
        entry_instrument["instrument_token"]
    ]
    ohlc = signal_details["ohlc"]
    result = signal_details["signal"]
    log.info(
        f"Entry Signal: {user.user_id} - {entry_instrument['tradingsymbol']}",
        result,
    )
    if result["signal"] not in strategy["trade_on_signal"] or not result["signal"]:
        return

    place_entry_order(user, strategy, ohlc, result["signal"])
    strategy["holding_direction"] = const.CACHE_EXIT_SIGNAL_DETAIL[
        strategy["exit_instrument"]["instrument_token"]
    ]["signal"]["signal"]
    user_collection.update_one(
        {"user_id": user.user_id, "strategies.name": strategy["name"]},
        {"$set": {"strategies.$": strategy}},
    )


def exit_order(user: User, strategy: Strategy):
    broker = user.broker
    exit_instrument = strategy["exit_instrument"]
    result = const.CACHE_EXIT_SIGNAL_DETAIL[exit_instrument["instrument_token"]][
        "signal"
    ]
    log.info(
        f"Exit Signal: {user.user_id} - {exit_instrument['tradingsymbol']}",
        result,
    )
    if (
        (
            result["signal"] == const.BUY
            and strategy["holding_direction"] == HOLDING_DIRECTION.LONG
        )
        or (
            result["signal"] == const.SELL
            and strategy["holding_direction"] == HOLDING_DIRECTION.SHORT
        )
        or strategy["holding_direction"] == HOLDING_DIRECTION.NA
    ):
        return

    # Sorted on transaction_type in reverse order to buy first
    trade_instruments = sorted(strategy["trade_instruments"], key=lambda x: x["transaction_type"], reverse=True)
    for trade_instrument in trade_instruments:
        if environ.get(const.Env.MOCK_TRADING):
            continue
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
        {"user_id": user.user_id, "strategies.name": strategy["name"]},
        {"$set": {"strategies.$": strategy}},
    )
