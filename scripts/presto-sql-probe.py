import json
import sys

import prestodb.dbapi

host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
catalog = sys.argv[3] if len(sys.argv) > 3 else "memory"
schema = sys.argv[4] if len(sys.argv) > 4 else "default"
user = sys.argv[5] if len(sys.argv) > 5 else "sqldesc"
queries_path = sys.argv[6] if len(sys.argv) > 6 else None

if not queries_path:
    raise SystemExit(
        "usage: presto-sql-probe.py <host> <port> <catalog> <schema> <user> <queries.json>",
    )

with open(queries_path, encoding="utf-8") as handle:
    queries = json.load(handle)

connection = prestodb.dbapi.connect(
    host=host,
    port=port,
    user=user,
    catalog=catalog,
    schema=schema,
    http_scheme="http",
)
cursor = connection.cursor()

setup = """
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER,
  name VARCHAR,
  age INTEGER,
  dept VARCHAR,
  amount DECIMAL(10, 2),
  data JSON,
  tags array(varchar),
  attrs map(varchar, varchar),
  created_at TIMESTAMP
);
CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL(10, 2)
);
INSERT INTO users VALUES
  (1, 'alice', 30, 'eng', 100.50, JSON '{"k":1,"x":"v"}', ARRAY['a', 'b'], MAP(ARRAY['a'], ARRAY['1']), TIMESTAMP '2024-01-01 00:00:00'),
  (2, 'bob', 25, 'eng', 200.00, JSON '{"k":2,"x":"w"}', ARRAY['c'], MAP(ARRAY['b'], ARRAY['2']), TIMESTAMP '2024-02-01 00:00:00'),
  (3, 'carol', 35, 'sales', 150.75, JSON '{"k":3,"x":"z"}', ARRAY['d', 'e'], MAP(ARRAY['c'], ARRAY['3']), TIMESTAMP '2024-03-01 00:00:00');
INSERT INTO orders VALUES
  (1, 1, 50.0),
  (2, 1, 75.5),
  (3, 2, 120.0);
"""

for statement in setup.strip().split(";\n"):
    statement = statement.strip().rstrip(";")
    if statement:
        cursor.execute(statement)

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
