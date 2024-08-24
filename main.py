import os
import time

from oms import trading
from utils.constants import Env


def main():
    os.environ["TZ"] = "Asia/Kolkata"
    if os.environ[Env.MACHINE_OS] in ("ubuntu",):
        time.tzset()
    trading.start()


if __name__ == "__main__":
    main()
