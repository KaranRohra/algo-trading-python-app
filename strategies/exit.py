from typing import List

from utils import constants as const
from strategies import utils as s_utils


def ema_exit_v1(ohlc: List, indicator_values_present: bool = False):
    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}
    if res["close"] < res["ema200"] or res["ema20"] < res["ema50"]:
        res["signal"] = const.SELL
    elif res["close"] > res["ema200"] or res["ema20"] > res["ema50"]:
        res["signal"] = const.BUY

    return res


def ema_exit_v2(ohlc: List, indicator_values_present: bool = False):

    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}

    if res["close"] < res["ema200"]:
        res["signal"] = const.SELL
    elif res["close"] > res["ema200"]:
        res["signal"] = const.BUY

    return res


def ema_exit_v3(ohlc: List, indicator_values_present: bool = False):
    if not indicator_values_present:
        s_utils.add_indicator_values(ohlc)

    res = {"signal": None, **ohlc[-1]}
    if res["ema20"] < res["ema100"]:
        res["signal"] = const.SELL
    elif res["ema20"] > res["ema100"]:
        res["signal"] = const.BUY

    return res
