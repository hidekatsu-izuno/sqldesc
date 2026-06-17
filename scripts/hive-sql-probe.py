import json
import sys

from pyhive import hive

host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
port = int(sys.argv[2]) if len(sys.argv) > 2 else 10000
database = sys.argv[3] if len(sys.argv) > 3 else "default"
user = sys.argv[4] if len(sys.argv) > 4 else "sqldesc"
queries_path = sys.argv[5] if len(sys.argv) > 5 else None

if not queries_path:
    raise SystemExit(
        "usage: hive-sql-probe.py <host> <port> <database> <user> <queries.json>",
    )

with open(queries_path, encoding="utf-8") as handle:
    queries = json.load(handle)

connection = hive.Connection(host=host, port=port, username=user, database="default")
cursor = connection.cursor()

setup = """
CREATE DATABASE IF NOT EXISTS sqldesc;
USE sqldesc;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT,
  name STRING,
  age INT,
  dept STRING,
  amount DECIMAL(10, 2),
  data STRING,
  tags ARRAY<STRING>,
  attrs MAP<STRING, STRING>,
  created_at TIMESTAMP
);
CREATE TABLE orders (
  id INT,
  user_id INT,
  amount DECIMAL(10, 2)
);
INSERT INTO users VALUES
  (1, 'alice', 30, 'eng', 100.50, '{"k":1,"x":"v"}', array('a', 'b'), map('a', '1'), timestamp '2024-01-01 00:00:00'),
  (2, 'bob', 25, 'eng', 200.00, '{"k":2,"x":"w"}', array('c'), map('b', '2'), timestamp '2024-02-01 00:00:00'),
  (3, 'carol', 35, 'sales', 150.75, '{"k":3,"x":"z"}', array('d', 'e'), map('c', '3'), timestamp '2024-03-01 00:00:00');
INSERT INTO orders VALUES
  (1, 1, 50.0),
  (2, 1, 75.5),
  (3, 2, 120.0);
"""

for statement in setup.strip().split(";\n"):
    statement = statement.strip().rstrip(";")
    if statement:
        cursor.execute(statement)

cursor.execute("USE sqldesc")

results = []

for item in queries:
    case_id = item["id"]
    sql = item["sql"]
    try:
        cursor.execute(sql)
        description = cursor.description or []
        columns = [{"name": column[0], "type": str(column[1])} for column in description]
        results.append({"id": case_id, "ok": True, "columns": columns})
    except Exception as exc:
        message = str(exc).split("\n", 1)[0]
        results.append({"id": case_id, "ok": False, "error": message})

cursor.close()
connection.close()
print(json.dumps(results))
