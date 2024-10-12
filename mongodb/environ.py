from mongodb import connection as mongo_connection
from utils.common import time_str_to_curr_datetime


class Environ:
    @classmethod
    def set_environ(cls):
        environs = mongo_connection.environments.find_one()
        Environ.start_time = time_str_to_curr_datetime(environs["start_time"])
        Environ.end_time = time_str_to_curr_datetime(environs["end_time"])
        Environ.force_stop = environs["force_stop"] == "1"
        Environ.send_email = environs["send_email"] == "1"
