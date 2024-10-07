from mongodb import connection as mongo_connection
from utils.common import time_str_to_curr_datetime


class Environ:
    def set_environ(self):
        environs = mongo_connection.environments.find_one()
        self.start_time = time_str_to_curr_datetime(environs["start_time"])
        self.end_time = time_str_to_curr_datetime(environs["end_time"])
        self.force_stop = environs["force_stop"] == "1"
        self.send_email = environs["send_email"] == "1"


GOOGLE_SHEET_ENVIRON = Environ()
