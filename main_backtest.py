import datetime as dt
from os import environ

import dotenv
import pandas as pd
import pyotp

from backtest import orders
from brokers import kite_connect
from strategies import entry, exit
from strategies import utils as s_utils

dotenv.load_dotenv()


def get_backtest_historical_data(
    instrument_token: int,
    start_date: dt.datetime,
    end_date: dt.datetime,
    interval: str,
    required_indicator_values: bool = True,
):
    user_id = environ["BACKTEST_USER_ID"]
    password = environ["BACKTEST_PASSWORD"]
    two_fa = environ["BACKTEST_TWO_FA"]

    kite = kite_connect.KiteConnect(user_id, password, pyotp.TOTP(two_fa).now())
    from_date = start_date
    to_date = from_date + dt.timedelta(days=95)

    historical_data = []
    while from_date <= end_date:
        hd = kite.historical_data(instrument_token, from_date, to_date, interval)
        if hd:
            historical_data.extend(hd)

        print(f"Fetched data for: {from_date} to {to_date}")
        from_date = to_date + dt.timedelta(seconds=to_date.second + 1)
        to_date = from_date + dt.timedelta(days=95)
        # time.sleep(1)

    if required_indicator_values:
        s_utils.add_indicator_values(historical_data)
    return historical_data


def start_backtest():
    INSTRUMENT_TOKEN = "256265"
    INTERVAL = "5minute"
    SYMBOL = "NIFTY 50_ema_adx_rsi_v2"
    ENTRY_FUNC = entry.ema_adx_rsi_entry_v2
    EXIT_FUNC = exit.ema_exit_v2
    FROM_DATE = dt.datetime(2015, 1, 1)
    TO_DATE = dt.datetime(2024, 8, 17)

    ohlc = get_backtest_historical_data(INSTRUMENT_TOKEN, FROM_DATE, TO_DATE, INTERVAL)

    trades = []
    holdings = []

    for i in range(500, len(ohlc)):
        limit_ohlc = ohlc[i - 500 : i + 1]
        if holdings:
            holdings[0]["symbol"] = SYMBOL
            orders.search_exit(EXIT_FUNC, limit_ohlc, holdings, trades)
        else:
            orders.search_entry(ENTRY_FUNC, limit_ohlc, holdings)

        print(f"Completed {i} / {len(ohlc)}")

    print(len(trades), holdings)
    pd.DataFrame(trades).to_csv(
        f'./backtest/data/{SYMBOL}_{FROM_DATE.strftime("%Y-%m-%d")}_to_{TO_DATE.strftime("%Y-%m-%d")}.csv'
    )


start_backtest()
