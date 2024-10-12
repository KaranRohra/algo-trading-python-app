import pymongo
from os import environ
from utils.constants import Env

_client = pymongo.MongoClient(environ[Env.MONGO_URI])
_db = _client[environ[Env.MONGO_DB]]
trades = _db["trades"]
holdings = _db["holdings"]
logs = _db["logs"]
users = _db["users"]
environments = _db["environment"]
