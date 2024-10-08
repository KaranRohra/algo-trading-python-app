from typing import List

import pandas as pd
from ta import momentum, trend


def cnt_above(left_key: str, right_key: str, ohlc: list):
    cnt = 0
    for i in range(len(ohlc) - 1, -1, -1):
        if ohlc[i][left_key] <= ohlc[i][right_key]:
            break
        cnt += 1
    return cnt


def add_indicator_values(ohlc: List):
    high_series = pd.Series([price["high"] for price in ohlc])
    low_series = pd.Series([price["low"] for price in ohlc])
    close_series = pd.Series([price["close"] for price in ohlc])

    ema20 = trend.ema_indicator(close_series, window=20, fillna=True).to_list()
    ema50 = trend.ema_indicator(close_series, window=50, fillna=True).to_list()
    ema100 = trend.ema_indicator(close_series, window=100, fillna=True).to_list()
    ema200 = trend.ema_indicator(close_series, window=200, fillna=True).to_list()

    adx = trend.adx(high_series, low_series, close_series, fillna=True).to_list()

    rsi = momentum.rsi(close_series, fillna=True).to_list()

    for i in range(len(ohlc)):
        obj = ohlc[i]
        obj["ema20"] = round(ema20[i], 2)
        obj["ema50"] = round(ema50[i], 2)
        obj["ema100"] = round(ema100[i], 2)
        obj["ema200"] = round(ema200[i], 2)

        obj["adx"] = round(adx[i], 2)
        obj["rsi"] = round(rsi[i], 2)
