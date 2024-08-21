from datetime import datetime


def title_to_snake(input_string: str) -> str:
    snake_case_string = input_string.replace(" ", "_").lower()
    return snake_case_string


def time_str_to_curr_datetime(time_string: str) -> datetime:
    now = datetime.now()
    return datetime.strptime(time_string, "%H:%M:%S").replace(
        year=now.year, month=now.month, day=now.day
    )


def get_risk_managed_qty(entry_price, stoploss, risk_amount):
    return risk_amount // abs(entry_price - stoploss)


def get_int_time_frame_from_str(time_frame: str):
    return {
        "minute": 1,
        "3minute": 3,
        "5minute": 5,
        "10minute": 10,
        "15minute": 15,
        "30minute": 30,
        "60minute": 60,
    }[time_frame]


def get_candle_limit(time_frame: str) -> str:
    return {
        "minute": 7,
        "3minute": 20,
        "5minute": 40,
        "10minute": 65,
        "15minute": 90,
        "30minute": 90,
        "60minute": 90,
    }[time_frame]
