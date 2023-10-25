import os

from sqlalchemy import create_engine
from sqlalchemy.schema import MetaData
from sqlalchemy.orm import declarative_base

from modules import scripts


Base = declarative_base() #定义一个基类
metadata: MetaData = Base.metadata

db_file = os.path.join(scripts.basedir(), "task_scheduler.sqlite3")

#创建一个db-file数据库，并进行链接
class BaseTableManager:
    def __init__(self, engine = None):
        # Get the db connection object, making the file and tables if needed.
        try:
            self.engine = engine if engine else create_engine(f"sqlite:///{db_file}")
        except Exception as e:
            print(f"Exception connecting to database: {e}")
            raise e

    def get_engine(self):
        return self.engine

    # Commit and close the database connection.
    def quit(self):
        self.engine.dispose()
