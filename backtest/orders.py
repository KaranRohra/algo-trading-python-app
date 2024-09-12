from typing import List

from utils import constants as const


def search_entry(strategy, ohlc: List, holdings: List):
    res: dict = strategy(ohlc, True)
    signal = res['signal']

    if len(holdings) == 1 or not signal:
        return

    if const.BUY == signal:
        res['entry_price'] = ohlc[-1]['high']
    else:  # const.SELL == signal
        res['entry_price'] = ohlc[-1]['low']

    res['from'] = ohlc[-1]['date']
    holdings.append(res)


def search_exit(strategy, ohlc: List, holdings: List, trades: List):
    res: dict = strategy(ohlc, True)
    signal = res['signal']

    if len(holdings) == 0 or not signal:
        return

    holding: dict = holdings[0]
    if const.BUY == signal and holding['signal'] == const.SELL:
        holding['exit_price'] = ohlc[-1]['close']
    elif const.SELL == signal and holding['signal'] == const.BUY:
        holding['exit_price'] = ohlc[-1]['close']

    if holding.get('exit_price'):
        holding['to'] = ohlc[-1]['date']
        trades.append({**holdings.pop()})
