import gspread

from gsheets import connection
from utils.constants import SheetIndex
from utils.common import title_to_snake, time_str_to_curr_datetime
from logs import log


class Environ:
    def set_values(
        self,
        start_time,
        end_time,
        force_stop,
        send_email,
    ):
        self.start_time = time_str_to_curr_datetime(start_time)
        self.end_time = time_str_to_curr_datetime(end_time)
        self.force_stop = force_stop == "1"
        self.send_email = send_email == "1"

    def set_environ(self):
        try:
            worksheet = connection.get_sheet().get_worksheet(SheetIndex.ENVIRON)
            values = worksheet.get_all_values()
            environ = {}

            for row in values:
                if len(row) >= 2:
                    environ[title_to_snake(row[0])] = row[1]

            log.info("Environ from google sheet updated", environ)
            self.set_values(**environ)
        except gspread.exceptions.GSpreadException as e:
            log.error(e, "Failed to updated environ from google sheet")


GOOGLE_SHEET_ENVIRON = Environ()
