from datetime import datetime as dt, timedelta as td
from threading import Thread

from mongodb.users import User, Strategy
from logs import log
from oms import orders
from utils import common
from typing import List
from strategies import entry, exit


def search_trade(user: User, strategyIndex: int, instrument_section: str, trade_func):
    strategy = user.strategies[strategyIndex]
    user.in_process_symbols.add(strategyIndex)
    try:
        trade_func(user, strategy)
    except Exception as e:
        log.error(
            e,
            f"{user.user_id} - Strategy: {strategyIndex} - {instrument_section} - {str(e)}",
        )
    finally:
        user.in_process_symbols.discard(strategyIndex)


def in_holding(user: User, strategy: Strategy):
    trade_instruments = strategy["trade_instruments"]
    for ti in trade_instruments:
        instrument_in_holding = False
        for h in user.holdings:
            if (
                h["instrument_token"] == ti["instrument_token"]
                and h["quantity"] >= ti["quantity"]
            ):
                instrument_in_holding = True
                break
        if not instrument_in_holding:
            return False

    return True


def set_historical_data(user: User, strategies: List[Strategy]):
    cache_ohlc = {}
    cache_entry_signal = {}
    cache_exit_signal = {}
    now = (dt.now() - td(minutes=1)).replace(second=59)
    for s in strategies:
        if not s["active"]:
            continue
        entry_instrument = s["entry_instrument"]
        exit_instrument = s["exit_instrument"]
        for i in [entry_instrument, exit_instrument]:
            if i["instrument_token"] not in cache_ohlc:
                ohlc = user.broker.historical_data(
                    entry_instrument,
                    from_date=now
                    - td(days=common.get_candle_limit(entry_instrument["timeframe"])),
                    to_date=now,
                    interval=entry_instrument["timeframe"],
                )
                cache_ohlc[i["instrument_token"]] = ohlc
                cache_entry_signal[i["instrument_token"]] = entry.ema_adx_rsi_entry_v2(
                    cache_ohlc[entry_instrument["instrument_token"]]
                )
                cache_exit_signal[i["instrument_token"]] = exit.ema_exit_v2(
                    cache_ohlc[exit_instrument["instrument_token"]]
                )

        entry_signal = cache_entry_signal[entry_instrument["instrument_token"]]
        exit_signal = cache_exit_signal[exit_instrument["instrument_token"]]
        ohlc = cache_ohlc[entry_instrument["instrument_token"]]
        entry_instrument["signal_details"] = {
            "ohlc": ohlc,
            "signal": entry_signal,
        }
        exit_instrument["signal_details"] = {
            "ohlc": ohlc,
            "signal": exit_signal,
        }


def scan_user_basket_without_handling_error(user: User):
    now = dt.now()
    if not user.active:
        return

    if now < user.start_time or now > user.end_time:
        return
    user.set_holdings()
    set_historical_data(user, user.strategies)
    for i in range(len(user.strategies)):
        s = user.strategies[i]
        if i in user.in_process_symbols or not s["active"]:
            continue
        entry_time_frame = common.get_int_time_frame_from_str(
            s["entry_instrument"]["timeframe"]
        )
        exit_time_frame = common.get_int_time_frame_from_str(
            s["exit_instrument"]["timeframe"]
        )
        trade_func, instrument_section = None, ""
        if not in_holding(user, s):
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
