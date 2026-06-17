import json
import sys

import teradatasql

host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
port = sys.argv[2] if len(sys.argv) > 2 else "1025"
user = sys.argv[3] if len(sys.argv) > 3 else "dbc"
password = sys.argv[4] if len(sys.argv) > 4 else "dbc"
queries_path = sys.argv[5] if len(sys.argv) > 5 else None

if not queries_path:
    raise SystemExit(
        "usage: teradata-sql-probe.py <host> <port> <user> <password> <queries.json>",
    )

with open(queries_path, encoding="utf-8") as handle:
    queries = json.load(handle)

connection = teradatasql.connect(
    host=host,
    user=user,
    password=password,
    logmech="TD2",
    dbs_port=port,
)
cursor = connection.cursor()

setup_statements = [
    "CREATE DATABASE db AS PERM = 1e9",
    """
CREATE MULTISET TABLE db.users, FALLBACK, NO BEFORE JOURNAL, NO AFTER JOURNAL (
  id INTEGER,
  name VARCHAR(255),
  age INTEGER,
  dept VARCHAR(255),
  amount DECIMAL(10,2),
  created_at TIMESTAMP(0)
) PRIMARY INDEX (id)
""",
    """
CREATE MULTISET TABLE db.orders, FALLBACK, NO BEFORE JOURNAL, NO AFTER JOURNAL (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL(10,2)
) PRIMARY INDEX (id)
""",
    "DELETE FROM db.users ALL",
    "DELETE FROM db.orders ALL",
    """
INSERT INTO db.users (id, name, age, dept, amount, created_at)
VALUES (1, 'alice', 30, 'eng', 100.50, TIMESTAMP '2024-01-01 00:00:00'),
       (2, 'bob', 25, 'eng', 200.00, TIMESTAMP '2024-02-01 00:00:00'),
       (3, 'carol', 35, 'sales', 150.75, TIMESTAMP '2024-03-01 00:00:00')
""",
    """
INSERT INTO db.orders (id, user_id, amount)
VALUES (1, 1, 50.0),
       (2, 1, 75.5),
       (3, 2, 120.0)
""",
]

for statement in setup_statements:
    try:
        cursor.execute(statement)
    except Exception as exc:
        message = str(exc)
        if "3807" in message and "Database" in message:
            continue
        if "3803" in message and "Table" in message:
            continue
        raise

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
