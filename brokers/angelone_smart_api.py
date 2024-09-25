import datetime
import json

import dateutil.parser
from SmartApi import SmartConnect


class AngelOneSmartConnect(SmartConnect):
    # Constants
    # Products
    PRODUCT_MIS = "INTRADAY"
    PRODUCT_CNC = "DELIVERY"
    PRODUCT_NRML = "CARRYFORWARD"
    PRODUCT_CO = "CO"

    # Order types
    ORDER_TYPE_MARKET = "MARKET"
    ORDER_TYPE_LIMIT = "LIMIT"
    ORDER_TYPE_SLM = "STOPLOSS_LIMIT"
    ORDER_TYPE_SL = "STOPLOSS_MARKET"

    # Varities
    VARIETY_REGULAR = "NORMAL"
    VARIETY_CO = "STOPLOSS"
    VARIETY_AMO = "AMO"

    # Transaction type
    TRANSACTION_TYPE_BUY = "BUY"
    TRANSACTION_TYPE_SELL = "SELL"

    # Validity
    VALIDITY_DAY = "DAY"
    VALIDITY_IOC = "IOC"

    # Position Type
    POSITION_TYPE_DAY = "day"
    POSITION_TYPE_OVERNIGHT = "overnight"

    # Exchanges
    EXCHANGE_NSE = "NSE"
    EXCHANGE_BSE = "BSE"
    EXCHANGE_NFO = "NFO"
    EXCHANGE_CDS = "CDS"
    EXCHANGE_BFO = "BFO"
    EXCHANGE_MCX = "MCX"
    EXCHANGE_BCD = "BCD"

    # Margins segments
    MARGIN_EQUITY = "equity"
    MARGIN_COMMODITY = "commodity"

    # Status constants
    STATUS_COMPLETE = "complete"
    STATUS_REJECTED = "rejected"
    STATUS_CANCELLED = "cancelled"

    def __init__(self, user_id, password, totp_value, **kwargs):
        super().__init__(**kwargs)
        self.generateSession(user_id, password, totp_value)

    # COMMMON FUNCTIONS BETWEEN BROKERS
    def holdings(self):
        """Retrieve the list of equity holdings."""
        holding_lst = self.holding()["data"] or []
        for h in holding_lst:
            h["instrument_token"] = h["symboltoken"]
            h["quantity"] = int(h["quantity"])

        return holding_lst

    def positions(self):
        """Retrieve the list of positions."""
        position_lst = self.position()["data"] or []
        for p in position_lst:
            p["instrument_token"] = p["symboltoken"]
            p["tradingsymbol"] = p["symbolname"]
            p["quantity"] = int(p["netqty"])
            p["product"] = p["producttype"]

        return {"net": position_lst}

    def historical_data(
        self, instrument_token, from_date, to_date, interval, continuous=False, oi=False
    ):
        """
        Retrieve historical data (candles) for an instrument.

        Although the actual response JSON from the API does not have field
        names such has 'open', 'high' etc., this function call structures
        the data into an array of objects with field names. For example:

        - `instrument_token` is the instrument identifier (retrieved from the instruments()) call.
        - `from_date` is the From date (datetime object or string in format of yyyy-mm-dd HH:MM.
        - `to_date` is the To date (datetime object or string in format of yyyy-mm-dd HH:MM).
        - `interval` is the candle interval (minute, day, 5 minute etc.).
        - `continuous` is a boolean flag to get continuous data for futures and options instruments.
        - `oi` is a boolean flag to get open interest.
        """
        date_string_format = "%Y-%m-%d %H:%M"
        from_date_string = (
            from_date.strftime(date_string_format)
            if type(from_date) == datetime.datetime
            else from_date
        )
        to_date_string = (
            to_date.strftime(date_string_format)
            if type(to_date) == datetime.datetime
            else to_date
        )

        symbol_details = [
            ms for ms in self.master_script if ms["instrument_token"] == instrument_token
        ][0]
        data = self.getCandleData(
            {
                "exchange": symbol_details["exchange"],
                "symboltoken": instrument_token,
                "interval": self._get_candle_interval(interval),
                "fromdate": from_date_string,
                "todate": to_date_string,
            }
        )

        return self._format_historical(data)

    def _get_candle_interval(self, interval):
        return {
            "minute": "ONE_MINUTE",
            "day": "ONE_DAY",
            "3minute": "THREE_MINUTE",
            "5minute": "FIVE_MINUTE",
            "10minute": "TEN_MINUTE",
            "15minute": "FIFTEEN_MINUTE",
            "30minute": "THIRTY_MINUTE",
            "60minute": "ONE_HOUR",
        }[interval]

    def _format_historical(self, data):
        records = []
        for d in data["data"]:
            record = {
                "date": dateutil.parser.parse(d[0]),
                "open": d[1],
                "high": d[2],
                "low": d[3],
                "close": d[4],
                "volume": d[5],
            }
            if len(d) == 7:
                record["oi"] = d[6]
            records.append(record)

        return records

    # orders
    def place_order(
        self,
        variety,
        exchange,
        tradingsymbol,
        transaction_type,
        quantity,
        product,
        order_type,
        price="0",
        validity=None,
        trigger_price="0",
    ):
        """Place an order."""
        symboltoken = [ms for ms in self.master_script if ms["tradingsymbol"] == tradingsymbol]
        symboltoken = symboltoken[0]["instrument_token"] if symboltoken else None
        order_details = {
            "variety": variety,
            "tradingsymbol": tradingsymbol,
            "symboltoken": symboltoken,
            "transactiontype": transaction_type,
            "exchange": exchange,
            "ordertype": order_type,
            "producttype": product,
            "duration": validity or self.VALIDITY_DAY,
            "price": price,
            "stoploss": trigger_price,
            "quantity": quantity,
        }
        return self.placeOrder(order_details)

    # orderbook and tradebook
    def orders(self):
        """Get list of orders."""
        orders_lst = self.orderBook()["data"] or []
        for o in orders_lst:
            o["order_id"] = o["orderid"]

        return orders_lst

    def order(self, order_id):
        """Get details of a particular order."""
        filter_order = [o for o in self.orders() if str(o["order_id"]) == str(order_id)]
        return filter_order[0] if filter_order else None

    def basket(self, name):
        """Fetch basket by basket name"""
        self.master_script = json.loads(name)
        return self.master_script

    def logout(self):
        """Logout from the session."""
        self.terminateSession(self.userId)
