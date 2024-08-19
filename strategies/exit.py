from typing import List

import pandas as pd
from ta import trend

from utils import constants as const


def ema_exit_v1(ohlc: List, indicator_values_present: bool = False):
    res = {"signal": None, **ohlc[-1]}
    res["close"] = ohlc[-1]["close"]

    if not indicator_values_present:
        close_series = pd.Series([price["close"] for price in ohlc])

        res["ema20"] = trend.ema_indicator(close_series, window=20).to_list()[-1]
        res["ema50"] = trend.ema_indicator(close_series, window=50).to_list()[-1]
        res["ema200"] = trend.ema_indicator(close_series, window=200).to_list()[-1]

    if res["close"] < res["ema200"] or res["ema20"] < res["ema50"]:
        res["signal"] = const.SELL

    if res["close"] > res["ema200"] or res["ema20"] > res["ema50"]:
        res["signal"] = const.BUY

    return res


def ema_exit_v2(ohlc: List, indicator_values_present: bool = False):
    res = {"signal": None, **ohlc[-1]}
    res["close"] = ohlc[-1]["close"]

    if not indicator_values_present:
        close_series = pd.Series([price["close"] for price in ohlc])
        res["ema200"] = trend.ema_indicator(close_series, window=200).to_list()[-1]

    if res["close"] < res["ema200"]:
        res["signal"] = const.SELL

    if res["close"] > res["ema200"]:
        res["signal"] = const.BUY

    return res
