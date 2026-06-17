import json
import sys

import pymssql

host = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
port = int(sys.argv[2]) if len(sys.argv) > 2 else 1433
password = sys.argv[3] if len(sys.argv) > 3 else "Str0ngPass!234"
queries_path = sys.argv[4] if len(sys.argv) > 4 else None

if not queries_path:
    raise SystemExit(
        "usage: fabric-sql-probe.py <host> <port> <password> <queries.json>",
    )

with open(queries_path, encoding="utf-8") as handle:
    queries = json.load(handle)

connection = pymssql.connect(
    host=host,
    port=port,
    user="sa",
    password=password,
    autocommit=True,
)
cursor = connection.cursor()

setup_statements = [
    "IF DB_ID('db') IS NULL CREATE DATABASE db",
    "USE db",
    """
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
  ALTER TABLE dbo.users SET (SYSTEM_VERSIONING = OFF)
""",
    "IF OBJECT_ID('dbo.users_history', 'U') IS NOT NULL DROP TABLE dbo.users_history",
    "IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders",
    "IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users",
    """
CREATE TABLE dbo.users (
  id INT PRIMARY KEY,
  name NVARCHAR(MAX),
  age INT,
  dept NVARCHAR(MAX),
  amount DECIMAL(38, 10),
  data NVARCHAR(MAX),
  tags NVARCHAR(MAX),
  created_at DATETIME2(7),
  d DATE,
  ValidFrom DATETIME2 GENERATED ALWAYS AS ROW START HIDDEN NOT NULL,
  ValidTo DATETIME2 GENERATED ALWAYS AS ROW END HIDDEN NOT NULL,
  PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo)
) WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.users_history))
""",
    """
CREATE TABLE dbo.orders (
  id INT,
  user_id INT,
  amount DECIMAL(38, 10)
)
""",
    """
INSERT INTO dbo.users (id, name, age, dept, amount, data, tags, created_at, d)
VALUES
  (1, N'alice', 30, N'eng', 100.50, N'{"k":1}', N'a,b', '2024-01-01T00:00:00', '2024-01-01'),
  (2, N'bob', 25, N'eng', 200.00, N'{"k":2}', N'c', '2024-02-01T00:00:00', '2024-02-01'),
  (3, N'carol', 35, N'sales', 150.75, N'{"k":3}', N'd,e', '2024-03-01T00:00:00', '2024-03-01')
""",
    """
INSERT INTO dbo.orders (id, user_id, amount)
VALUES (1, 1, 50.0), (2, 1, 75.5), (3, 2, 120.0)
""",
]

for statement in setup_statements:
    statement = statement.strip()
    if statement:
        cursor.execute(statement)

results = []

for item in queries:
    case_id = item["id"]
    sql = item["sql"]
    try:
        cursor.execute("USE db")
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
