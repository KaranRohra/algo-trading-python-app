from typing import List

from utils import constants as const
from strategies import utils as s_utils


def ema_adx_rsi_entry_v1(ohlc: List, indicator_values_present: bool = False):
    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}

    res["max_high"] = max([obj["high"] for obj in ohlc[-10:-1]])
    res["min_low"] = min([obj["low"] for obj in ohlc[-10:-1]])

    res["close_above_ema50_cnt"] = s_utils.cnt_above("close", "ema50", ohlc)
    res["close_below_ema50_cnt"] = s_utils.cnt_above("ema50", "close", ohlc)
    res["ema50_above_ema200_cnt"] = s_utils.cnt_above("ema50", "ema200", ohlc)
    res["ema50_below_ema200_cnt"] = s_utils.cnt_above("ema200", "ema50", ohlc)

    if (
        res["close"] > res["ema50"] > res["ema200"]
        and res["adx"] >= 25
        and res["rsi"] >= 65
        and res["close_above_ema50_cnt"] >= 5
        and res["ema50_above_ema200_cnt"] >= 5
        and res["close"] > res["max_high"]
    ):
        res["signal"] = const.BUY
    if (
        res["close"] < res["ema50"] < res["ema200"]
        and res["adx"] >= 25
        and res["rsi"] <= 35
        and res["close_below_ema50_cnt"] >= 5
        and res["ema50_below_ema200_cnt"] >= 5
        and res["close"] < res["min_low"]
    ):
        res["signal"] = const.SELL

    return res


def ema_adx_rsi_entry_v2(ohlc: List, indicator_values_present: bool = False):
    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}

    res["max_high"] = max([obj["high"] for obj in ohlc[-10:-1]])
    res["min_low"] = min([obj["low"] for obj in ohlc[-10:-1]])

    res["close_above_ema50_cnt"] = s_utils.cnt_above("close", "ema50", ohlc)
    res["close_below_ema50_cnt"] = s_utils.cnt_above("ema50", "close", ohlc)
    res["ema50_above_ema200_cnt"] = s_utils.cnt_above("ema50", "ema200", ohlc)
    res["ema50_below_ema200_cnt"] = s_utils.cnt_above("ema200", "ema50", ohlc)

    if (
        res["close"] > res["ema50"] > res["ema200"]
        and res["adx"] >= 20
        and res["rsi"] >= 65
        and res["close_above_ema50_cnt"] >= 5
        and res["ema50_above_ema200_cnt"] >= 5
        and res["close"] > res["max_high"]
    ):
        res["signal"] = const.BUY
    if (
        res["close"] < res["ema50"] < res["ema200"]
        and res["adx"] >= 20
        and res["rsi"] <= 35
        and res["close_below_ema50_cnt"] >= 5
        and res["ema50_below_ema200_cnt"] >= 5
        and res["close"] < res["min_low"]
    ):
        res["signal"] = const.SELL

    return res


def ema_adx_rsi_entry_v3(ohlc: List, indicator_values_present: bool = False):
    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}

    res["max_high"] = max([obj["high"] for obj in ohlc[-20:-1]])
    res["min_low"] = min([obj["low"] for obj in ohlc[-20:-1]])

    res["close_above_ema50_cnt"] = s_utils.cnt_above("close", "ema50", ohlc)
    res["close_below_ema50_cnt"] = s_utils.cnt_above("ema50", "close", ohlc)
    res["ema50_above_ema200_cnt"] = s_utils.cnt_above("ema50", "ema200", ohlc)
    res["ema50_below_ema200_cnt"] = s_utils.cnt_above("ema200", "ema50", ohlc)

    if (
        res["close"] > res["ema50"] > res["ema200"]
        and res["adx"] >= 20
        and res["rsi"] >= 60
        and res["close_above_ema50_cnt"] >= 5
        and res["ema50_above_ema200_cnt"] >= 5
        and res["close"] > res["max_high"]
    ):
        res["signal"] = const.BUY
    if (
        res["close"] < res["ema50"] < res["ema200"]
        and res["adx"] >= 20
        and res["rsi"] <= 40
        and res["close_below_ema50_cnt"] >= 5
        and res["ema50_below_ema200_cnt"] >= 5
        and res["close"] < res["min_low"]
    ):
        res["signal"] = const.SELL

    return res
