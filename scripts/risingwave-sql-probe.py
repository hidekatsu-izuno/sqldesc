import json
import sys

import psycopg2

host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
port = int(sys.argv[2]) if len(sys.argv) > 2 else 4566
database = sys.argv[3] if len(sys.argv) > 3 else "dev"
user = sys.argv[4] if len(sys.argv) > 4 else "root"
queries_path = sys.argv[5] if len(sys.argv) > 5 else None

if not queries_path:
    raise SystemExit(
        "usage: risingwave-sql-probe.py <host> <port> <database> <user> <queries.json>",
    )

with open(queries_path, encoding="utf-8") as handle:
    queries = json.load(handle)

connection = psycopg2.connect(
    host=host,
    port=port,
    dbname=database,
    user=user,
)
connection.autocommit = True
cursor = connection.cursor()

setup = """
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT,
  name VARCHAR,
  age INT,
  dept VARCHAR,
  amount DECIMAL,
  data JSONB,
  created_at TIMESTAMP,
  tags TEXT[]
);
CREATE TABLE orders (
  id INT,
  user_id INT,
  amount DECIMAL
);
INSERT INTO users VALUES
  (1, 'alice', 30, 'eng', 100.50, '{"k":1,"x":"v"}', '2024-01-01 00:00:00', ARRAY['a', 'b']),
  (2, 'bob', 25, 'eng', 200.00, '{"k":2,"x":"w"}', '2024-02-01 00:00:00', ARRAY['c']),
  (3, 'carol', 35, 'sales', 150.75, '{"k":3,"x":"z"}', '2024-03-01 00:00:00', ARRAY['d', 'e']);
INSERT INTO orders VALUES
  (1, 1, 50.0),
  (2, 1, 75.5),
  (3, 2, 120.0);
"""

for statement in setup.strip().split(";\n"):
    statement = statement.strip()
    if statement:
        cursor.execute(statement)

results = []

for item in queries:
    case_id = item["id"]
    sql = item["sql"]
    try:
        cursor.execute(sql)
        description = cursor.description or []
        columns = [{"name": column.name, "type": str(column.type_code)} for column in description]
        results.append({"id": case_id, "ok": True, "columns": columns})
    except Exception as exc:
        message = str(exc).split("\n", 1)[0]
        results.append({"id": case_id, "ok": False, "error": message})

cursor.close()
connection.close()
print(json.dumps(results))
