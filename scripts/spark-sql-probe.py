import json
import sys
from datetime import datetime
from decimal import Decimal

from pyspark.sql import Row, SparkSession

spark = (
    SparkSession.builder.appName("sqldesc-verify")
    .master("local[1]")
    .config("spark.ui.enabled", "false")
    .config("spark.sql.warehouse.dir", "/tmp/spark-warehouse")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")

for table in ("users", "orders"):
    spark.sql(f"DROP TABLE IF EXISTS {table}")

users_df = spark.createDataFrame(
    [
        Row(id=1, name="alice", age=30, dept="eng", amount=Decimal("100.50"), data='{"k":1}', tags=["a", "b"], attrs={"x": 1}, created_at=datetime(2024, 1, 1)),
        Row(id=2, name="bob", age=25, dept="eng", amount=Decimal("200.00"), data='{"k":2}', tags=["c"], attrs={"y": 2}, created_at=datetime(2024, 2, 1)),
        Row(id=3, name="carol", age=35, dept="sales", amount=Decimal("150.75"), data='{"k":3}', tags=["d", "e"], attrs={"z": 3}, created_at=datetime(2024, 3, 1)),
    ]
)
orders_df = spark.createDataFrame(
    [
        Row(id=1, user_id=1, amount=Decimal("50.0")),
        Row(id=2, user_id=1, amount=Decimal("75.5")),
        Row(id=3, user_id=2, amount=Decimal("120.0")),
    ]
)

users_df.write.mode("overwrite").saveAsTable("users")
orders_df.write.mode("overwrite").saveAsTable("orders")

if len(sys.argv) > 1:
    with open(sys.argv[1], encoding="utf-8") as handle:
        queries = json.load(handle)
else:
    queries = json.loads(sys.stdin.read())

results = []

for item in queries:
    case_id = item["id"]
    sql = item["sql"]
    try:
        df = spark.sql(sql)
        columns = [{"name": field.name, "type": field.dataType.simpleString()} for field in df.schema.fields]
        results.append({"id": case_id, "ok": True, "columns": columns})
    except Exception as exc:
        message = str(exc).split("\n", 1)[0]
        results.append({"id": case_id, "ok": False, "error": message})

spark.stop()
print(json.dumps(results))
