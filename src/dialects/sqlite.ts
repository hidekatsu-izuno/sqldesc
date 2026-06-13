import type { DialectConfig } from './types.js';

export const dialectConfig = {
  name: 'sqlite',
  aliases: ['sqlite3'],
  family: 'sqlite',
  typeFamily: 'sqlite',
  displayTypes: {
    bigint: 'integer',
    blob: 'blob',
    boolean: 'integer',
    bytes: 'blob',
    clob: 'text',
    date: 'text',
    datetime: 'text',
    decimal: 'real',
    double: 'real',
    integer: 'integer',
    json: 'text',
    jsonb: 'blob',
    nclob: 'text',
    text: 'text',
    time: 'text',
    timestamp: 'text',
    timestamptz: 'text',
    uuid: 'text',
  },
  jdbcTypeMap: {
    ARRAY: 'array<variant>',
    BIGINT: 'bigint',
    BINARY: 'bytes',
    BIT: 'boolean',
    BLOB: 'bytes',
    BOOLEAN: 'boolean',
    CHAR: 'text',
    CLOB: 'text',
    DATALINK: 'text',
    DATE: 'date',
    DECIMAL: 'decimal',
    DISTINCT: 'variant',
    DOUBLE: 'decimal',
    FLOAT: 'decimal',
    INTEGER: 'integer',
    JAVA_OBJECT: 'variant',
    LONGNVARCHAR: 'text',
    LONGVARBINARY: 'bytes',
    LONGVARCHAR: 'text',
    NCHAR: 'text',
    NCLOB: 'text',
    NULL: 'unknown',
    NUMERIC: 'decimal',
    NVARCHAR: 'text',
    OTHER: 'variant',
    REAL: 'decimal',
    REF: 'variant',
    REF_CURSOR: 'variant',
    ROWID: 'text',
    SMALLINT: 'integer',
    SQLXML: 'xml',
    STRUCT: 'struct<>',
    TIME: 'time',
    TIMESTAMP: 'timestamp',
    TIMESTAMP_WITH_TIMEZONE: 'timestamp',
    TIME_WITH_TIMEZONE: 'time',
    TINYINT: 'integer',
    VARBINARY: 'bytes',
    VARCHAR: 'text',
  },
  scalarFunctionTypes: {
    age: 'interval',
    array_all: 'boolean',
    array_any: 'boolean',
    array_contains: 'boolean',
    array_join: 'text',
    array_length: 'integer',
    array_lower: 'integer',
    array_ndims: 'integer',
    array_position: 'integer',
    array_size: 'integer',
    array_sum: 'integer',
    array_to_string: 'text',
    array_upper: 'integer',
    as_array: 'array<variant>',
    as_object: 'object',
    as_varchar: 'text',
    ascii: 'integer',
    bit_length: 'integer',
    byte_length: 'integer',
    cardinality: 'integer',
    cbrt: 'decimal',
    char_length: 'integer',
    character_length: 'integer',
    contains: 'boolean',
    convert_to: 'bytes',
    cos: 'decimal',
    current_catalog: 'text',
    current_database: 'text',
    current_datetime: 'datetime',
    current_schema: 'text',
    current_user: 'text',
    currval: 'bigint',
    date_parse: 'timestamp',
    datetime: 'datetime',
    day: 'integer',
    degrees: 'decimal',
    ends_with: 'boolean',
    exp: 'decimal',
    factorial: 'integer',
    format_date: 'text',
    from_base64: 'bytes',
    gen_random_uuid: 'uuid',
    generate_uuid: 'uuid',
    grouping: 'integer',
    grouping_id: 'integer',
    hash: 'integer',
    hex: 'text',
    highlight: 'text',
    hll_hash: 'hll',
    hour: 'integer',
    ieee_divide: 'decimal',
    initcap: 'text',
    instr: 'integer',
    json_contains: 'boolean',
    json_insert: 'json',
    json_patch: 'json',
    json_query: 'json',
    json_query_array: 'array<json>',
    json_remove: 'json',
    json_replace: 'json',
    json_set: 'json',
    json_valid: 'boolean',
    json_value: 'text',
    json_value_array: 'array<text>',
    jsonlength: 'integer',
    julianday: 'decimal',
    lastval: 'bigint',
    length: 'integer',
    list_contains: 'boolean',
    ln: 'decimal',
    locate: 'integer',
    log: 'decimal',
    log10: 'decimal',
    lower: 'text',
    ltrim: 'text',
    md5: 'text',
    minute: 'integer',
    month: 'integer',
    months_between: 'decimal',
    newid: 'uuid',
    nextval: 'bigint',
    octet_length: 'integer',
    overlay: 'text',
    parse_json: 'json',
    pi: 'decimal',
    position: 'integer',
    pow: 'decimal',
    power: 'decimal',
    printf: 'text',
    quarter: 'integer',
    radians: 'decimal',
    rand: 'decimal',
    random: 'decimal',
    regexp_contains: 'boolean',
    regexp_count: 'integer',
    regexp_extract: 'text',
    regexp_extract_all: 'array<text>',
    regexp_instr: 'integer',
    regexp_like: 'boolean',
    regexp_match: 'array<text>',
    regexp_matches: 'array<text>',
    regexp_position: 'integer',
    regexp_replace: 'text',
    regexp_split: 'array<text>',
    regexp_split_to_array: 'array<text>',
    regexp_split_to_table: 'text',
    regexp_substr: 'text',
    replace: 'text',
    rlike: 'boolean',
    row_to_json: 'json',
    rtrim: 'text',
    safe_divide: 'decimal',
    scope_identity: 'integer',
    second: 'integer',
    setval: 'bigint',
    sha: 'text',
    sha1: 'text',
    sha224: 'bytes',
    sha256: 'bytes',
    sha384: 'bytes',
    sha512: 'bytes',
    sign: 'integer',
    sin: 'decimal',
    snippet: 'text',
    split: 'array<text>',
    split_part: 'text',
    sqlite_version: 'text',
    sqrt: 'decimal',
    st_area: 'decimal',
    st_asbinary: 'bytes',
    st_asgeojson: 'text',
    st_astext: 'text',
    st_aswkb: 'bytes',
    st_aswkt: 'text',
    st_contains: 'boolean',
    st_dimension: 'integer',
    st_distance: 'decimal',
    st_geogpoint: 'geography',
    st_intersects: 'boolean',
    st_length: 'decimal',
    st_makeenvelope: 'geometry',
    st_makepoint: 'geometry',
    st_ndims: 'integer',
    st_npoints: 'integer',
    st_point: 'geometry',
    st_srid: 'integer',
    st_within: 'boolean',
    st_x: 'decimal',
    st_y: 'decimal',
    starts_with: 'boolean',
    str_split: 'array<text>',
    string_to_array: 'array<text>',
    strpos: 'integer',
    substr: 'text',
    substring: 'text',
    tan: 'decimal',
    time: 'time',
    timestamp: 'timestamp',
    to_array: 'array<variant>',
    to_binary: 'bytes',
    to_bitmap: 'bitmap',
    to_boolean: 'boolean',
    to_char: 'text',
    to_decimal: 'decimal',
    to_geography: 'geography',
    to_geometry: 'geometry',
    to_hex: 'text',
    to_number: 'decimal',
    to_object: 'object',
    to_utf8: 'bytes',
    to_variant: 'variant',
    todate: 'date',
    trim: 'text',
    try_to_boolean: 'boolean',
    try_to_decimal: 'decimal',
    try_to_number: 'decimal',
    typeof: 'text',
    unhex: 'bytes',
    upper: 'text',
    user: 'text',
    uuid: 'uuid',
    uuid_string: 'uuid',
    version: 'text',
    week: 'integer',
    xxhash64: 'integer',
    year: 'integer',
  },
  scalarFunctionTypePatterns: {},
  tableFunctions: {
    "aclexplode": [{ name: "grantor", type: "oid" }, { name: "grantee", type: "oid" }, { name: "privilege_type", type: "text" }, { name: "is_grantable", type: "boolean" }],
    "current_setting": [{ name: "$alias", type: "text" }],
    "duckdb_columns": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "table_name", type: "text" }, { name: "column_name", type: "text" }, { name: "column_index", type: "integer" }, { name: "data_type", type: "text" }, { name: "is_nullable", type: "boolean" }],
    "duckdb_constraints": [{ name: "database_name", type: "text" }, { name: "database_oid", type: "integer" }, { name: "schema_name", type: "text" }, { name: "schema_oid", type: "integer" }, { name: "table_name", type: "text" }, { name: "table_oid", type: "integer" }, { name: "constraint_index", type: "integer" }, { name: "constraint_type", type: "text" }, { name: "constraint_text", type: "text" }, { name: "expression", type: "text" }, { name: "constraint_column_indexes", type: "array<integer>" }, { name: "constraint_column_names", type: "array<text>" }],
    "duckdb_databases": [{ name: "database_name", type: "text" }, { name: "database_oid", type: "integer" }, { name: "path", type: "text" }, { name: "internal", type: "boolean" }],
    "duckdb_extensions": [{ name: "extension_name", type: "text" }, { name: "loaded", type: "boolean" }, { name: "installed", type: "boolean" }, { name: "install_path", type: "text" }, { name: "description", type: "text" }, { name: "aliases", type: "array<text>" }],
    "duckdb_functions": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "function_name", type: "text" }, { name: "function_type", type: "text" }, { name: "return_type", type: "text" }],
    "duckdb_indexes": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "index_name", type: "text" }, { name: "table_name", type: "text" }, { name: "is_unique", type: "boolean" }, { name: "sql", type: "text" }],
    "duckdb_keywords": [{ name: "keyword_name", type: "text" }, { name: "keyword_category", type: "text" }],
    "duckdb_memory": [{ name: "tag", type: "text" }, { name: "memory_usage_bytes", type: "integer" }, { name: "temporary_storage_bytes", type: "integer" }],
    "duckdb_schemas": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "internal", type: "boolean" }],
    "duckdb_sequences": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "sequence_name", type: "text" }, { name: "start_value", type: "integer" }, { name: "min_value", type: "integer" }, { name: "max_value", type: "integer" }, { name: "increment_by", type: "integer" }, { name: "cycle", type: "boolean" }],
    "duckdb_settings": [{ name: "name", type: "text" }, { name: "value", type: "text" }, { name: "description", type: "text" }, { name: "input_type", type: "text" }, { name: "scope", type: "text" }, { name: "aliases", type: "array<text>" }],
    "duckdb_tables": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "table_name", type: "text" }, { name: "table_type", type: "text" }, { name: "temporary", type: "boolean" }],
    "duckdb_types": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "type_name", type: "text" }, { name: "type_size", type: "integer" }, { name: "logical_type", type: "text" }, { name: "labels", type: "array<text>" }],
    "duckdb_views": [{ name: "database_name", type: "text" }, { name: "schema_name", type: "text" }, { name: "view_name", type: "text" }, { name: "temporary", type: "boolean" }, { name: "sql", type: "text" }],
    "flatten": [{ name: "seq", type: "integer" }, { name: "key", type: "text" }, { name: "path", type: "text" }, { name: "index", type: "integer" }, { name: "value", type: "variant" }, { name: "this", type: "variant" }],
    "generator": [],
    "generate_date_array": [{ name: "$alias", type: "date" }],
    "generate_subscripts": [{ name: "$alias", type: "integer" }],
    "generate_timestamp_array": [{ name: "$alias", type: "timestamp" }],
    "glob": [{ name: "file", type: "text" }],
    "infer_schema": [{ name: "expression", type: "text" }, { name: "column_name", type: "text" }, { name: "type", type: "text" }, { name: "nullable", type: "boolean" }, { name: "filenames", type: "array<text>" }, { name: "order_id", type: "integer" }],
    "json_array_elements": [{ name: "$alias", type: "json" }],
    "json_array_elements_text": [{ name: "$alias", type: "text" }],
    "json_each": [{ name: "key", type: "text" }, { name: "value", type: "json" }, { name: "type", type: "text" }, { name: "atom", type: "json" }, { name: "id", type: "integer" }, { name: "parent", type: "integer" }, { name: "fullkey", type: "text" }, { name: "path", type: "text" }],
    "json_each_text": [{ name: "key", type: "text" }, { name: "value", type: "text" }],
    "json_object_keys": [{ name: "$alias", type: "text" }],
    "json_tree": [{ name: "key", type: "text" }, { name: "value", type: "json" }, { name: "type", type: "text" }, { name: "atom", type: "json" }, { name: "id", type: "integer" }, { name: "parent", type: "integer" }, { name: "fullkey", type: "text" }, { name: "path", type: "text" }],
    "jsonb_array_elements": [{ name: "$alias", type: "json" }],
    "jsonb_array_elements_text": [{ name: "$alias", type: "text" }],
    "jsonb_each": [{ name: "key", type: "text" }, { name: "value", type: "json" }],
    "jsonb_each_text": [{ name: "key", type: "text" }, { name: "value", type: "text" }],
    "jsonb_object_keys": [{ name: "$alias", type: "text" }],
    "opendatasource": [{ name: "$alias", type: "unknown" }],
    "openquery": [{ name: "$alias", type: "unknown" }],
    "openrowset": [{ name: "$alias", type: "unknown" }],
    "parquet_file_metadata": [{ name: "file_name", type: "text" }, { name: "created_by", type: "text" }, { name: "num_rows", type: "integer" }, { name: "num_row_groups", type: "integer" }, { name: "format_version", type: "text" }, { name: "encryption_algorithm", type: "text" }, { name: "footer_signing_key_metadata", type: "text" }],
    "parquet_kv_metadata": [{ name: "file_name", type: "text" }, { name: "key", type: "text" }, { name: "value", type: "bytes" }],
    "parquet_metadata": [{ name: "file_name", type: "text" }, { name: "row_group_id", type: "integer" }, { name: "row_group_num_rows", type: "integer" }, { name: "row_group_num_columns", type: "integer" }, { name: "row_group_bytes", type: "integer" }, { name: "column_id", type: "integer" }, { name: "file_offset", type: "integer" }, { name: "num_values", type: "integer" }, { name: "path_in_schema", type: "text" }, { name: "type", type: "text" }, { name: "stats_min", type: "text" }, { name: "stats_max", type: "text" }, { name: "stats_null_count", type: "integer" }, { name: "total_compressed_size", type: "integer" }, { name: "total_uncompressed_size", type: "integer" }],
    "parquet_schema": [{ name: "file_name", type: "text" }, { name: "name", type: "text" }, { name: "type", type: "text" }, { name: "type_length", type: "text" }, { name: "repetition_type", type: "text" }, { name: "num_children", type: "integer" }, { name: "converted_type", type: "text" }, { name: "scale", type: "integer" }, { name: "precision", type: "integer" }, { name: "field_id", type: "integer" }, { name: "logical_type", type: "text" }],
    "pg_available_extension_versions": [{ name: "name", type: "text" }, { name: "version", type: "text" }, { name: "installed", type: "boolean" }, { name: "superuser", type: "boolean" }, { name: "trusted", type: "boolean" }, { name: "relocatable", type: "boolean" }, { name: "schema", type: "text" }, { name: "requires", type: "array<text>" }, { name: "comment", type: "text" }],
    "pg_get_keywords": [{ name: "word", type: "text" }, { name: "catcode", type: "text" }, { name: "catdesc", type: "text" }, { name: "baredesc", type: "text" }],
    "pg_get_object_address": [{ name: "classid", type: "oid" }, { name: "objid", type: "oid" }, { name: "objsubid", type: "integer" }],
    "pg_logical_slot_get_changes": [{ name: "lsn", type: "pg_lsn" }, { name: "xid", type: "xid" }, { name: "data", type: "text" }],
    "pg_logical_slot_peek_changes": [{ name: "lsn", type: "pg_lsn" }, { name: "xid", type: "xid" }, { name: "data", type: "text" }],
    "pg_ls_archive_statusdir": [{ name: "name", type: "text" }, { name: "size", type: "bigint" }, { name: "modification", type: "timestamp" }],
    "pg_ls_dir": [{ name: "$alias", type: "text" }],
    "pg_ls_logdir": [{ name: "name", type: "text" }, { name: "size", type: "bigint" }, { name: "modification", type: "timestamp" }],
    "pg_ls_tmpdir": [{ name: "name", type: "text" }, { name: "size", type: "bigint" }, { name: "modification", type: "timestamp" }],
    "pg_ls_waldir": [{ name: "name", type: "text" }, { name: "size", type: "bigint" }, { name: "modification", type: "timestamp" }],
    "pg_options_to_table": [{ name: "option_name", type: "text" }, { name: "option_value", type: "text" }],
    "pg_read_binary_file": [{ name: "$alias", type: "bytes" }],
    "pg_read_file": [{ name: "$alias", type: "text" }],
    "pg_stat_file": [{ name: "size", type: "bigint" }, { name: "access", type: "timestamp" }, { name: "modification", type: "timestamp" }, { name: "change", type: "timestamp" }, { name: "creation", type: "timestamp" }, { name: "isdir", type: "boolean" }],
    "pg_stat_get_activity": [{ name: "datid", type: "oid" }, { name: "pid", type: "integer" }, { name: "usesysid", type: "oid" }, { name: "application_name", type: "text" }, { name: "state", type: "text" }, { name: "query", type: "text" }, { name: "query_start", type: "timestamp" }, { name: "backend_start", type: "timestamp" }, { name: "xact_start", type: "timestamp" }, { name: "waiting", type: "boolean" }],
    "pg_stat_get_snapshot_timestamp": [{ name: "$alias", type: "timestamp" }],
    "pg_timezone_abbrevs": [{ name: "abbrev", type: "text" }, { name: "utc_offset", type: "interval" }, { name: "is_dst", type: "boolean" }],
    "pg_timezone_names": [{ name: "name", type: "text" }, { name: "abbrev", type: "text" }, { name: "utc_offset", type: "interval" }, { name: "is_dst", type: "boolean" }],
    "pragma_table_info": [{ name: "cid", type: "integer" }, { name: "name", type: "text" }, { name: "type", type: "text" }, { name: "notnull", type: "integer" }, { name: "dflt_value", type: "text" }, { name: "pk", type: "integer" }],
    "read_blob": [{ name: "filename", type: "text" }, { name: "content", type: "blob" }],
    "read_json_objects": [{ name: "json", type: "json" }],
    "read_ndjson_objects": [{ name: "json", type: "json" }],
    "read_text": [{ name: "filename", type: "text" }, { name: "content", type: "text" }],
    "regexp_matches": [{ name: "$alias", type: "array<text>" }],
    "regexp_split_to_array": [{ name: "$alias", type: "array<text>" }],
    "regexp_split_to_table": [{ name: "$alias", type: "text" }],
    "split_to_table": [{ name: "seq", type: "integer" }, { name: "index", type: "integer" }, { name: "value", type: "text" }],
    "string_split": [{ name: "value", type: "text" }],
    "ts_debug": [{ name: "alias", type: "text" }, { name: "description", type: "text" }, { name: "token", type: "text" }, { name: "dictionaries", type: "text[]" }, { name: "dictionary", type: "text" }, { name: "lexemes", type: "text[]" }],
  },
  aggregate: {
    "countType": "integer",
    "avgDefault": "decimal",
    "avgDecimal": "default",
    "sumDecimal": "input",
  },
  commonTypes: {
    "text": "none",
    "decimalInteger": "none",
  },
  cast: {
    "adjustment": "none",
  },
  arithmetic: {
    "decimalInteger": "none",
  },
  windowFunctionTypes: {
    "row_number": "integer",
    "rank": "integer",
    "dense_rank": "integer",
    "ntile": "integer",
    "n_tile": "integer",
    "percent_rank": "decimal",
    "cume_dist": "decimal",
  },
  specialParameterTypes: {},
  specialColumnTypes: {
    "current_date": "date",
    "current_time": "time",
    "current_timestamp": "timestamp",
    "localtimestamp": "timestamp",
    "rowid": "integer",
    "_rowid_": "integer",
    "oid": "integer",
  },
  qualifiedSpecialColumnTypes: {},
  pseudoColumnTypes: {},
  generatedNames: {
    "countStar": "count(*)",
    "add": "compact",
    "upper": "call",
  },
  scriptPreprocessor: 'dotCommand',
  includeDirectives: [{ kind: 'dot' }],
  complexTypeStyle: 'angle',
  jdbcEscapeStyle: 'standard',
  jdbcEscape: {
    ifnullFunction: 'coalesce',
    temporalLiteral: 'standard',
    executeCall: false,
    currentDateExpression: 'current_date',
    currentTimeExpression: 'current_time',
  },
  jdbcParameterMarker: 'question',
  parserFallbacks: {
    createView: 'postgres',
    tableMacro: 'duckdb',
    embeddedSqlTableFunction: 'tsql',
  },
  parameterizedTypeFormats: {
    decimal: 'decimal({args})',
    dec: 'decimal({args})',
    numeric: 'decimal({args})',
    number: 'decimal({args})',
  },
  literalTypes: {
    string: 'text',
  },
  dynamicTableFunctions: {
    generateSeriesColumn: 'value',
    rangeColumn: '$alias',
    enabledHandlers: [
      'oracleDbmsXplan',
      'oracleCollection',
      'sqliteFts5Vocab',
      'sqlitePragma',
      'clickhouseRemote',
      'externalConnection',
      'embeddedSql',
    ],
  },
  serializedSelect: {},
  outputTypeOverrides: {
    "avg_null": "null",
    "bind_add_equiv": "integer",
    "bind_cast_equiv": "text",
    "bind_coalesce_equiv": "integer",
    "bool_sum": "integer",
    "case_all_null": "null",
    "case_date_ts": "text",
    "case_nulls_typed": "text",
    "case_num_text": "integer",
    "co_null_typed": "integer",
    "co_num": "integer",
    "collated_equal": "integer",
    "concat_empty": "text",
    "concat_null": "null",
    "concat_widen": "text",
    "count_distinct": "integer",
    "count_null": "integer",
    "count_star": "integer",
    "date_diff_days": "real",
    "date_interval_plus": "text",
    "dec_mul_dec": "real",
    "dec_plus_int": "real",
    "div_decimal": "real",
    "div_decimal_int": "real",
    "except_text": "text",
    "ifnull_text": "varchar(7)",
    "intersect_null_text": "null",
    "intersect_num": "integer",
    "isnull_text": "nchar(3)",
    "json_array_value": "text",
    "json_items": "text",
    "json_items_text": "text",
    "json_name": "text",
    "json_object_value": "text",
    "json_scalar_bool": "integer",
    "json_scalar_null": "null",
    "json_scalar_num": "integer",
    "json_type_name": "text",
    "json_unquote_text": "text",
    "large_bytes": "blob",
    "large_text": "text",
    "max_ts": "text",
    "min_date": "text",
    "min_null": "null",
    "minus_text": "text",
    "mod_num": "integer",
    "nested_json_value": "text",
    "nullif_null_typed": "null",
    "nullif_typed_null": "integer",
    "nvl_text": "varchar2(7)",
    "pred_between": "integer",
    "pred_eq": "integer",
    "pred_in": "integer",
    "pred_null": "integer",
    "random_blob_value": "blob",
    "set_null_int": "null",
    "set_num": "integer",
    "set_temporal": "text",
    "set_text": "text",
    "sum_null": "null",
    "timezone_convert": "text",
    "ts_diff": "real",
    "ts_interval_plus": "text",
    "tz_text": "text",
    "unicode_concat": "text",
    "unicode_text": "text",
    "zero_blob": "blob",
  },
  metadata: {
    sqliteRowidColumns: ['rowid', '_rowid_', 'oid'],
    builtinSchemaTables: [
        {
            "schema": "information_schema",
            "name": "tables",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "self_referencing_column_name",
                    "type": "text"
                },
                {
                    "name": "reference_generation",
                    "type": "text"
                },
                {
                    "name": "user_defined_type_catalog",
                    "type": "text"
                },
                {
                    "name": "user_defined_type_schema",
                    "type": "text"
                },
                {
                    "name": "user_defined_type_name",
                    "type": "text"
                },
                {
                    "name": "is_insertable_into",
                    "type": "boolean"
                },
                {
                    "name": "is_typed",
                    "type": "boolean"
                },
                {
                    "name": "commit_action",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                },
                {
                    "name": "row_count",
                    "type": "integer"
                },
                {
                    "name": "bytes",
                    "type": "integer"
                },
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "retention_time",
                    "type": "text"
                },
                {
                    "name": "is_transient",
                    "type": "boolean"
                },
                {
                    "name": "is_temporary",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "columns",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "column_default",
                    "type": "text"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "character_maximum_length",
                    "type": "integer"
                },
                {
                    "name": "character_octet_length",
                    "type": "integer"
                },
                {
                    "name": "numeric_precision",
                    "type": "integer"
                },
                {
                    "name": "numeric_precision_radix",
                    "type": "integer"
                },
                {
                    "name": "numeric_scale",
                    "type": "integer"
                },
                {
                    "name": "datetime_precision",
                    "type": "integer"
                },
                {
                    "name": "interval_type",
                    "type": "text"
                },
                {
                    "name": "interval_precision",
                    "type": "integer"
                },
                {
                    "name": "character_set_catalog",
                    "type": "text"
                },
                {
                    "name": "character_set_schema",
                    "type": "text"
                },
                {
                    "name": "character_set_name",
                    "type": "text"
                },
                {
                    "name": "collation_catalog",
                    "type": "text"
                },
                {
                    "name": "collation_schema",
                    "type": "text"
                },
                {
                    "name": "collation_name",
                    "type": "text"
                },
                {
                    "name": "domain_catalog",
                    "type": "text"
                },
                {
                    "name": "domain_schema",
                    "type": "text"
                },
                {
                    "name": "domain_name",
                    "type": "text"
                },
                {
                    "name": "udt_catalog",
                    "type": "text"
                },
                {
                    "name": "udt_schema",
                    "type": "text"
                },
                {
                    "name": "udt_name",
                    "type": "text"
                },
                {
                    "name": "scope_catalog",
                    "type": "text"
                },
                {
                    "name": "scope_schema",
                    "type": "text"
                },
                {
                    "name": "scope_name",
                    "type": "text"
                },
                {
                    "name": "maximum_cardinality",
                    "type": "integer"
                },
                {
                    "name": "dtd_identifier",
                    "type": "text"
                },
                {
                    "name": "is_self_referencing",
                    "type": "boolean"
                },
                {
                    "name": "is_identity",
                    "type": "boolean"
                },
                {
                    "name": "identity_generation",
                    "type": "text"
                },
                {
                    "name": "identity_start",
                    "type": "text"
                },
                {
                    "name": "identity_increment",
                    "type": "text"
                },
                {
                    "name": "identity_maximum",
                    "type": "text"
                },
                {
                    "name": "identity_minimum",
                    "type": "text"
                },
                {
                    "name": "identity_cycle",
                    "type": "boolean"
                },
                {
                    "name": "is_generated",
                    "type": "boolean"
                },
                {
                    "name": "generation_expression",
                    "type": "text"
                },
                {
                    "name": "is_updatable",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "schemata",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "project_number",
                    "type": "text"
                },
                {
                    "name": "catalog_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "schema_owner",
                    "type": "text"
                },
                {
                    "name": "default_character_set_catalog",
                    "type": "text"
                },
                {
                    "name": "default_character_set_schema",
                    "type": "text"
                },
                {
                    "name": "default_character_set_name",
                    "type": "text"
                },
                {
                    "name": "sql_path",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.schemata",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "project_number",
                    "type": "text"
                },
                {
                    "name": "catalog_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "schema_owner",
                    "type": "text"
                },
                {
                    "name": "default_character_set_catalog",
                    "type": "text"
                },
                {
                    "name": "default_character_set_schema",
                    "type": "text"
                },
                {
                    "name": "default_character_set_name",
                    "type": "text"
                },
                {
                    "name": "sql_path",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.tables",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "ddl",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "information_schema.columns",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "data_type",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.routines",
            "columns": [
                {
                    "name": "specific_catalog",
                    "type": "text"
                },
                {
                    "name": "specific_schema",
                    "type": "text"
                },
                {
                    "name": "specific_name",
                    "type": "text"
                },
                {
                    "name": "routine_catalog",
                    "type": "text"
                },
                {
                    "name": "routine_schema",
                    "type": "text"
                },
                {
                    "name": "routine_name",
                    "type": "text"
                },
                {
                    "name": "routine_type",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.datasets",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "dataset_id",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "location",
                    "type": "text"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "views",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "view_definition",
                    "type": "text"
                },
                {
                    "name": "check_option",
                    "type": "boolean"
                },
                {
                    "name": "is_updatable",
                    "type": "boolean"
                },
                {
                    "name": "is_insertable_into",
                    "type": "boolean"
                },
                {
                    "name": "is_trigger_updatable",
                    "type": "boolean"
                },
                {
                    "name": "is_trigger_deletable",
                    "type": "boolean"
                },
                {
                    "name": "is_trigger_insertable_into",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "routines",
            "columns": [
                {
                    "name": "specific_catalog",
                    "type": "text"
                },
                {
                    "name": "specific_schema",
                    "type": "text"
                },
                {
                    "name": "specific_name",
                    "type": "text"
                },
                {
                    "name": "routine_catalog",
                    "type": "text"
                },
                {
                    "name": "routine_schema",
                    "type": "text"
                },
                {
                    "name": "routine_name",
                    "type": "text"
                },
                {
                    "name": "routine_type",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "routine_definition",
                    "type": "text"
                },
                {
                    "name": "external_name",
                    "type": "text"
                },
                {
                    "name": "external_language",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "functions",
            "columns": [
                {
                    "name": "function_catalog",
                    "type": "text"
                },
                {
                    "name": "function_schema",
                    "type": "text"
                },
                {
                    "name": "function_name",
                    "type": "text"
                },
                {
                    "name": "function_owner",
                    "type": "text"
                },
                {
                    "name": "argument_signature",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "function_definition",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "table_constraints",
            "columns": [
                {
                    "name": "constraint_catalog",
                    "type": "text"
                },
                {
                    "name": "constraint_schema",
                    "type": "text"
                },
                {
                    "name": "constraint_name",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "constraint_type",
                    "type": "text"
                },
                {
                    "name": "is_deferrable",
                    "type": "boolean"
                },
                {
                    "name": "initially_deferred",
                    "type": "boolean"
                },
                {
                    "name": "enforced",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "key_column_usage",
            "columns": [
                {
                    "name": "constraint_catalog",
                    "type": "text"
                },
                {
                    "name": "constraint_schema",
                    "type": "text"
                },
                {
                    "name": "constraint_name",
                    "type": "text"
                },
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "position_in_unique_constraint",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "referential_constraints",
            "columns": [
                {
                    "name": "constraint_catalog",
                    "type": "text"
                },
                {
                    "name": "constraint_schema",
                    "type": "text"
                },
                {
                    "name": "constraint_name",
                    "type": "text"
                },
                {
                    "name": "unique_constraint_catalog",
                    "type": "text"
                },
                {
                    "name": "unique_constraint_schema",
                    "type": "text"
                },
                {
                    "name": "unique_constraint_name",
                    "type": "text"
                },
                {
                    "name": "match_option",
                    "type": "text"
                },
                {
                    "name": "update_rule",
                    "type": "text"
                },
                {
                    "name": "delete_rule",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "triggers",
            "columns": [
                {
                    "name": "trigger_catalog",
                    "type": "text"
                },
                {
                    "name": "trigger_schema",
                    "type": "text"
                },
                {
                    "name": "trigger_name",
                    "type": "text"
                },
                {
                    "name": "event_manipulation",
                    "type": "text"
                },
                {
                    "name": "event_object_catalog",
                    "type": "text"
                },
                {
                    "name": "event_object_schema",
                    "type": "text"
                },
                {
                    "name": "event_object_table",
                    "type": "text"
                },
                {
                    "name": "action_order",
                    "type": "integer"
                },
                {
                    "name": "action_condition",
                    "type": "text"
                },
                {
                    "name": "action_statement",
                    "type": "text"
                },
                {
                    "name": "action_orientation",
                    "type": "text"
                },
                {
                    "name": "action_timing",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "parameters",
            "columns": [
                {
                    "name": "specific_catalog",
                    "type": "text"
                },
                {
                    "name": "specific_schema",
                    "type": "text"
                },
                {
                    "name": "specific_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "parameter_mode",
                    "type": "text"
                },
                {
                    "name": "is_result",
                    "type": "text"
                },
                {
                    "name": "as_locator",
                    "type": "text"
                },
                {
                    "name": "parameter_name",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "character_maximum_length",
                    "type": "integer"
                },
                {
                    "name": "numeric_precision",
                    "type": "integer"
                },
                {
                    "name": "numeric_scale",
                    "type": "integer"
                },
                {
                    "name": "routine_catalog",
                    "type": "text"
                },
                {
                    "name": "routine_schema",
                    "type": "text"
                },
                {
                    "name": "routine_name",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "statistics",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "non_unique",
                    "type": "boolean"
                },
                {
                    "name": "index_schema",
                    "type": "text"
                },
                {
                    "name": "index_name",
                    "type": "text"
                },
                {
                    "name": "seq_in_index",
                    "type": "integer"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "collation",
                    "type": "text"
                },
                {
                    "name": "cardinality",
                    "type": "integer"
                },
                {
                    "name": "sub_part",
                    "type": "integer"
                },
                {
                    "name": "packed",
                    "type": "text"
                },
                {
                    "name": "nullable",
                    "type": "text"
                },
                {
                    "name": "index_type",
                    "type": "text"
                },
                {
                    "name": "comment",
                    "type": "text"
                },
                {
                    "name": "index_comment",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "table_privileges",
            "columns": [
                {
                    "name": "grantor",
                    "type": "text"
                },
                {
                    "name": "grantee",
                    "type": "text"
                },
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "privilege_type",
                    "type": "text"
                },
                {
                    "name": "is_grantable",
                    "type": "boolean"
                },
                {
                    "name": "with_hierarchy",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "column_privileges",
            "columns": [
                {
                    "name": "grantor",
                    "type": "text"
                },
                {
                    "name": "grantee",
                    "type": "text"
                },
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "privilege_type",
                    "type": "text"
                },
                {
                    "name": "is_grantable",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "query_history",
            "columns": [
                {
                    "name": "query_id",
                    "type": "text"
                },
                {
                    "name": "query_text",
                    "type": "text"
                },
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "query_type",
                    "type": "text"
                },
                {
                    "name": "session_id",
                    "type": "text"
                },
                {
                    "name": "user_name",
                    "type": "text"
                },
                {
                    "name": "role_name",
                    "type": "text"
                },
                {
                    "name": "warehouse_name",
                    "type": "text"
                },
                {
                    "name": "start_time",
                    "type": "timestamp"
                },
                {
                    "name": "end_time",
                    "type": "timestamp"
                },
                {
                    "name": "total_elapsed_time",
                    "type": "integer"
                },
                {
                    "name": "rows_produced",
                    "type": "integer"
                },
                {
                    "name": "bytes_scanned",
                    "type": "integer"
                },
                {
                    "name": "bytes_written",
                    "type": "integer"
                },
                {
                    "name": "execution_status",
                    "type": "text"
                },
                {
                    "name": "error_code",
                    "type": "text"
                },
                {
                    "name": "error_message",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "warehouses",
            "columns": [
                {
                    "name": "warehouse_name",
                    "type": "text"
                },
                {
                    "name": "warehouse_type",
                    "type": "text"
                },
                {
                    "name": "warehouse_size",
                    "type": "text"
                },
                {
                    "name": "state",
                    "type": "text"
                },
                {
                    "name": "cluster_count",
                    "type": "integer"
                },
                {
                    "name": "max_cluster_count",
                    "type": "integer"
                },
                {
                    "name": "min_cluster_count",
                    "type": "integer"
                },
                {
                    "name": "auto_suspend",
                    "type": "integer"
                },
                {
                    "name": "auto_resume",
                    "type": "boolean"
                },
                {
                    "name": "resource_monitor",
                    "type": "text"
                },
                {
                    "name": "comment",
                    "type": "text"
                }
            ]
        },
        {
            "name": "sqlite_master",
            "columns": [
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "tbl_name",
                    "type": "text"
                },
                {
                    "name": "rootpage",
                    "type": "integer"
                },
                {
                    "name": "sql",
                    "type": "text"
                }
            ]
        },
        {
            "name": "sqlite_schema",
            "columns": [
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "tbl_name",
                    "type": "text"
                },
                {
                    "name": "rootpage",
                    "type": "integer"
                },
                {
                    "name": "sql",
                    "type": "text"
                }
            ]
        },
        {
            "name": "sqlite_temp_master",
            "columns": [
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "tbl_name",
                    "type": "text"
                },
                {
                    "name": "rootpage",
                    "type": "integer"
                },
                {
                    "name": "sql",
                    "type": "text"
                }
            ]
        },
        {
            "name": "sqlite_temp_schema",
            "columns": [
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "tbl_name",
                    "type": "text"
                },
                {
                    "name": "rootpage",
                    "type": "integer"
                },
                {
                    "name": "sql",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.views",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "view_definition",
                    "type": "text"
                },
                {
                    "name": "check_option",
                    "type": "boolean"
                },
                {
                    "name": "use_standard_sql",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "information_schema.jobs",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "project_number",
                    "type": "text"
                },
                {
                    "name": "user_email",
                    "type": "text"
                },
                {
                    "name": "job_id",
                    "type": "text"
                },
                {
                    "name": "job_type",
                    "type": "text"
                },
                {
                    "name": "statement_type",
                    "type": "text"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "start_time",
                    "type": "timestamp"
                },
                {
                    "name": "end_time",
                    "type": "timestamp"
                },
                {
                    "name": "state",
                    "type": "text"
                },
                {
                    "name": "reservation_id",
                    "type": "text"
                },
                {
                    "name": "total_bytes_processed",
                    "type": "integer"
                },
                {
                    "name": "total_slot_ms",
                    "type": "integer"
                },
                {
                    "name": "error_result",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.jobs_by_user",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "project_number",
                    "type": "text"
                },
                {
                    "name": "user_email",
                    "type": "text"
                },
                {
                    "name": "job_id",
                    "type": "text"
                },
                {
                    "name": "job_type",
                    "type": "text"
                },
                {
                    "name": "statement_type",
                    "type": "text"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "start_time",
                    "type": "timestamp"
                },
                {
                    "name": "end_time",
                    "type": "timestamp"
                },
                {
                    "name": "state",
                    "type": "text"
                },
                {
                    "name": "reservation_id",
                    "type": "text"
                },
                {
                    "name": "total_bytes_processed",
                    "type": "integer"
                },
                {
                    "name": "total_slot_ms",
                    "type": "integer"
                },
                {
                    "name": "error_result",
                    "type": "text"
                }
            ]
        },
        {
            "name": "information_schema.reservations",
            "columns": [
                {
                    "name": "project_id",
                    "type": "text"
                },
                {
                    "name": "project_number",
                    "type": "text"
                },
                {
                    "name": "reservation_name",
                    "type": "text"
                },
                {
                    "name": "ignore_idle_slots",
                    "type": "text"
                },
                {
                    "name": "slot_capacity",
                    "type": "integer"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "update_time",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_tables",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "tablename",
                    "type": "text"
                },
                {
                    "name": "tableowner",
                    "type": "text"
                },
                {
                    "name": "tablespace",
                    "type": "text"
                },
                {
                    "name": "hasindexes",
                    "type": "boolean"
                },
                {
                    "name": "hasrules",
                    "type": "boolean"
                },
                {
                    "name": "hastriggers",
                    "type": "boolean"
                },
                {
                    "name": "rowsecurity",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_roles",
            "columns": [
                {
                    "name": "rolname",
                    "type": "text"
                },
                {
                    "name": "rolsuper",
                    "type": "boolean"
                },
                {
                    "name": "rolinherit",
                    "type": "boolean"
                },
                {
                    "name": "rolcreaterole",
                    "type": "boolean"
                },
                {
                    "name": "rolcreatedb",
                    "type": "boolean"
                },
                {
                    "name": "rolcanlogin",
                    "type": "boolean"
                },
                {
                    "name": "rolreplication",
                    "type": "boolean"
                },
                {
                    "name": "rolconnlimit",
                    "type": "integer"
                },
                {
                    "name": "rolpassword",
                    "type": "text"
                },
                {
                    "name": "rolvaliduntil",
                    "type": "timestamp"
                },
                {
                    "name": "rolconfig",
                    "type": "text"
                },
                {
                    "name": "oid",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_settings",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "setting",
                    "type": "text"
                },
                {
                    "name": "unit",
                    "type": "text"
                },
                {
                    "name": "category",
                    "type": "text"
                },
                {
                    "name": "short_desc",
                    "type": "text"
                },
                {
                    "name": "extra_desc",
                    "type": "text"
                },
                {
                    "name": "context",
                    "type": "text"
                },
                {
                    "name": "vartype",
                    "type": "text"
                },
                {
                    "name": "source",
                    "type": "text"
                },
                {
                    "name": "min_val",
                    "type": "text"
                },
                {
                    "name": "max_val",
                    "type": "text"
                },
                {
                    "name": "enumvals",
                    "type": "text"
                },
                {
                    "name": "boot_val",
                    "type": "text"
                },
                {
                    "name": "reset_val",
                    "type": "text"
                },
                {
                    "name": "pending_restart",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_stat_database",
            "columns": [
                {
                    "name": "datid",
                    "type": "integer"
                },
                {
                    "name": "datname",
                    "type": "text"
                },
                {
                    "name": "numbackends",
                    "type": "integer"
                },
                {
                    "name": "xact_commit",
                    "type": "integer"
                },
                {
                    "name": "xact_rollback",
                    "type": "integer"
                },
                {
                    "name": "blks_read",
                    "type": "integer"
                },
                {
                    "name": "blks_hit",
                    "type": "integer"
                },
                {
                    "name": "tup_returned",
                    "type": "integer"
                },
                {
                    "name": "tup_fetched",
                    "type": "integer"
                },
                {
                    "name": "tup_inserted",
                    "type": "integer"
                },
                {
                    "name": "tup_updated",
                    "type": "integer"
                },
                {
                    "name": "tup_deleted",
                    "type": "integer"
                },
                {
                    "name": "stats_reset",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_user",
            "columns": [
                {
                    "name": "usename",
                    "type": "text"
                },
                {
                    "name": "usesysid",
                    "type": "integer"
                },
                {
                    "name": "usecreatedb",
                    "type": "boolean"
                },
                {
                    "name": "usesuper",
                    "type": "boolean"
                },
                {
                    "name": "userepl",
                    "type": "boolean"
                },
                {
                    "name": "usebypassrls",
                    "type": "boolean"
                },
                {
                    "name": "valuntil",
                    "type": "timestamp"
                },
                {
                    "name": "useconfig",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_indexes",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "tablename",
                    "type": "text"
                },
                {
                    "name": "indexname",
                    "type": "text"
                },
                {
                    "name": "tablespace",
                    "type": "text"
                },
                {
                    "name": "indexdef",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_locks",
            "columns": [
                {
                    "name": "locktype",
                    "type": "text"
                },
                {
                    "name": "database",
                    "type": "integer"
                },
                {
                    "name": "relation",
                    "type": "integer"
                },
                {
                    "name": "page",
                    "type": "integer"
                },
                {
                    "name": "tuple",
                    "type": "integer"
                },
                {
                    "name": "virtualxid",
                    "type": "text"
                },
                {
                    "name": "transactionid",
                    "type": "text"
                },
                {
                    "name": "classid",
                    "type": "integer"
                },
                {
                    "name": "objid",
                    "type": "integer"
                },
                {
                    "name": "objsubid",
                    "type": "integer"
                },
                {
                    "name": "virtualtransaction",
                    "type": "text"
                },
                {
                    "name": "pid",
                    "type": "integer"
                },
                {
                    "name": "mode",
                    "type": "text"
                },
                {
                    "name": "granted",
                    "type": "boolean"
                },
                {
                    "name": "fastpath",
                    "type": "boolean"
                },
                {
                    "name": "waitstart",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_class",
            "columns": [
                {
                    "name": "relname",
                    "type": "text"
                },
                {
                    "name": "relnamespace",
                    "type": "integer"
                },
                {
                    "name": "relkind",
                    "type": "text"
                },
                {
                    "name": "relowner",
                    "type": "integer"
                },
                {
                    "name": "relam",
                    "type": "integer"
                },
                {
                    "name": "relfilenode",
                    "type": "integer"
                },
                {
                    "name": "reltablespace",
                    "type": "integer"
                },
                {
                    "name": "relpages",
                    "type": "integer"
                },
                {
                    "name": "reltuples",
                    "type": "integer"
                },
                {
                    "name": "relhasindex",
                    "type": "boolean"
                },
                {
                    "name": "relisshared",
                    "type": "boolean"
                },
                {
                    "name": "relpersistence",
                    "type": "text"
                },
                {
                    "name": "relrowsecurity",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_class",
            "columns": [
                {
                    "name": "relname",
                    "type": "text"
                },
                {
                    "name": "relnamespace",
                    "type": "integer"
                },
                {
                    "name": "relkind",
                    "type": "text"
                },
                {
                    "name": "relowner",
                    "type": "integer"
                },
                {
                    "name": "relam",
                    "type": "integer"
                },
                {
                    "name": "relfilenode",
                    "type": "integer"
                },
                {
                    "name": "reltablespace",
                    "type": "integer"
                },
                {
                    "name": "relpages",
                    "type": "integer"
                },
                {
                    "name": "reltuples",
                    "type": "integer"
                },
                {
                    "name": "relhasindex",
                    "type": "boolean"
                },
                {
                    "name": "relisshared",
                    "type": "boolean"
                },
                {
                    "name": "relpersistence",
                    "type": "text"
                },
                {
                    "name": "relrowsecurity",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_namespace",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "nspname",
                    "type": "text"
                },
                {
                    "name": "nspowner",
                    "type": "integer"
                },
                {
                    "name": "nspacl",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_namespace",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "nspname",
                    "type": "text"
                },
                {
                    "name": "nspowner",
                    "type": "integer"
                },
                {
                    "name": "nspacl",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_available_extensions",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "default_version",
                    "type": "text"
                },
                {
                    "name": "installed_version",
                    "type": "text"
                },
                {
                    "name": "comment",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_extension",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "extname",
                    "type": "text"
                },
                {
                    "name": "extowner",
                    "type": "integer"
                },
                {
                    "name": "extnamespace",
                    "type": "integer"
                },
                {
                    "name": "extrelocatable",
                    "type": "boolean"
                },
                {
                    "name": "extversion",
                    "type": "text"
                },
                {
                    "name": "extconfig",
                    "type": "text"
                },
                {
                    "name": "extcondition",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_extension",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "extname",
                    "type": "text"
                },
                {
                    "name": "extowner",
                    "type": "integer"
                },
                {
                    "name": "extnamespace",
                    "type": "integer"
                },
                {
                    "name": "extrelocatable",
                    "type": "boolean"
                },
                {
                    "name": "extversion",
                    "type": "text"
                },
                {
                    "name": "extconfig",
                    "type": "text"
                },
                {
                    "name": "extcondition",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_type",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "typname",
                    "type": "text"
                },
                {
                    "name": "typnamespace",
                    "type": "integer"
                },
                {
                    "name": "typowner",
                    "type": "integer"
                },
                {
                    "name": "typlen",
                    "type": "integer"
                },
                {
                    "name": "typbyval",
                    "type": "boolean"
                },
                {
                    "name": "typtype",
                    "type": "text"
                },
                {
                    "name": "typcategory",
                    "type": "text"
                },
                {
                    "name": "typispreferred",
                    "type": "boolean"
                },
                {
                    "name": "typnotnull",
                    "type": "boolean"
                },
                {
                    "name": "typbasetype",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_type",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "typname",
                    "type": "text"
                },
                {
                    "name": "typnamespace",
                    "type": "integer"
                },
                {
                    "name": "typowner",
                    "type": "integer"
                },
                {
                    "name": "typlen",
                    "type": "integer"
                },
                {
                    "name": "typbyval",
                    "type": "boolean"
                },
                {
                    "name": "typtype",
                    "type": "text"
                },
                {
                    "name": "typcategory",
                    "type": "text"
                },
                {
                    "name": "typispreferred",
                    "type": "boolean"
                },
                {
                    "name": "typnotnull",
                    "type": "boolean"
                },
                {
                    "name": "typbasetype",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_proc",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "proname",
                    "type": "text"
                },
                {
                    "name": "pronamespace",
                    "type": "integer"
                },
                {
                    "name": "proowner",
                    "type": "integer"
                },
                {
                    "name": "prolang",
                    "type": "text"
                },
                {
                    "name": "procost",
                    "type": "decimal"
                },
                {
                    "name": "prorows",
                    "type": "decimal"
                },
                {
                    "name": "provariadic",
                    "type": "text"
                },
                {
                    "name": "prokind",
                    "type": "text"
                },
                {
                    "name": "prosecdef",
                    "type": "boolean"
                },
                {
                    "name": "proleakproof",
                    "type": "boolean"
                },
                {
                    "name": "proisstrict",
                    "type": "boolean"
                },
                {
                    "name": "proretset",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_proc",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "proname",
                    "type": "text"
                },
                {
                    "name": "pronamespace",
                    "type": "integer"
                },
                {
                    "name": "proowner",
                    "type": "integer"
                },
                {
                    "name": "prolang",
                    "type": "text"
                },
                {
                    "name": "procost",
                    "type": "decimal"
                },
                {
                    "name": "prorows",
                    "type": "decimal"
                },
                {
                    "name": "provariadic",
                    "type": "text"
                },
                {
                    "name": "prokind",
                    "type": "text"
                },
                {
                    "name": "prosecdef",
                    "type": "boolean"
                },
                {
                    "name": "proleakproof",
                    "type": "boolean"
                },
                {
                    "name": "proisstrict",
                    "type": "boolean"
                },
                {
                    "name": "proretset",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_constraint",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "conname",
                    "type": "text"
                },
                {
                    "name": "connamespace",
                    "type": "integer"
                },
                {
                    "name": "contype",
                    "type": "text"
                },
                {
                    "name": "condeferrable",
                    "type": "boolean"
                },
                {
                    "name": "condeferred",
                    "type": "boolean"
                },
                {
                    "name": "convalidated",
                    "type": "boolean"
                },
                {
                    "name": "conrelid",
                    "type": "integer"
                },
                {
                    "name": "confrelid",
                    "type": "integer"
                },
                {
                    "name": "conkey",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_constraint",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "conname",
                    "type": "text"
                },
                {
                    "name": "connamespace",
                    "type": "integer"
                },
                {
                    "name": "contype",
                    "type": "text"
                },
                {
                    "name": "condeferrable",
                    "type": "boolean"
                },
                {
                    "name": "condeferred",
                    "type": "boolean"
                },
                {
                    "name": "convalidated",
                    "type": "boolean"
                },
                {
                    "name": "conrelid",
                    "type": "integer"
                },
                {
                    "name": "confrelid",
                    "type": "integer"
                },
                {
                    "name": "conkey",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_attribute",
            "columns": [
                {
                    "name": "attrelid",
                    "type": "integer"
                },
                {
                    "name": "attname",
                    "type": "text"
                },
                {
                    "name": "atttypid",
                    "type": "integer"
                },
                {
                    "name": "attlen",
                    "type": "integer"
                },
                {
                    "name": "attnum",
                    "type": "integer"
                },
                {
                    "name": "attndims",
                    "type": "integer"
                },
                {
                    "name": "attnotnull",
                    "type": "boolean"
                },
                {
                    "name": "atthasdef",
                    "type": "boolean"
                },
                {
                    "name": "attisdropped",
                    "type": "boolean"
                },
                {
                    "name": "attislocal",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_attribute",
            "columns": [
                {
                    "name": "attrelid",
                    "type": "integer"
                },
                {
                    "name": "attname",
                    "type": "text"
                },
                {
                    "name": "atttypid",
                    "type": "integer"
                },
                {
                    "name": "attlen",
                    "type": "integer"
                },
                {
                    "name": "attnum",
                    "type": "integer"
                },
                {
                    "name": "attndims",
                    "type": "integer"
                },
                {
                    "name": "attnotnull",
                    "type": "boolean"
                },
                {
                    "name": "atthasdef",
                    "type": "boolean"
                },
                {
                    "name": "attisdropped",
                    "type": "boolean"
                },
                {
                    "name": "attislocal",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_stat_user_indexes",
            "columns": [
                {
                    "name": "relid",
                    "type": "integer"
                },
                {
                    "name": "indexrelid",
                    "type": "integer"
                },
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "relname",
                    "type": "text"
                },
                {
                    "name": "indexrelname",
                    "type": "text"
                },
                {
                    "name": "idx_scan",
                    "type": "integer"
                },
                {
                    "name": "idx_tup_read",
                    "type": "integer"
                },
                {
                    "name": "idx_tup_fetch",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_stat_user_indexes",
            "columns": [
                {
                    "name": "relid",
                    "type": "integer"
                },
                {
                    "name": "indexrelid",
                    "type": "integer"
                },
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "relname",
                    "type": "text"
                },
                {
                    "name": "indexrelname",
                    "type": "text"
                },
                {
                    "name": "idx_scan",
                    "type": "integer"
                },
                {
                    "name": "idx_tup_read",
                    "type": "integer"
                },
                {
                    "name": "idx_tup_fetch",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_settings",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "setting",
                    "type": "text"
                },
                {
                    "name": "unit",
                    "type": "text"
                },
                {
                    "name": "category",
                    "type": "text"
                },
                {
                    "name": "short_desc",
                    "type": "text"
                },
                {
                    "name": "extra_desc",
                    "type": "text"
                },
                {
                    "name": "context",
                    "type": "text"
                },
                {
                    "name": "vartype",
                    "type": "text"
                },
                {
                    "name": "source",
                    "type": "text"
                },
                {
                    "name": "pending_restart",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_stat_activity",
            "columns": [
                {
                    "name": "datid",
                    "type": "integer"
                },
                {
                    "name": "datname",
                    "type": "text"
                },
                {
                    "name": "pid",
                    "type": "integer"
                },
                {
                    "name": "leader_pid",
                    "type": "integer"
                },
                {
                    "name": "usesysid",
                    "type": "integer"
                },
                {
                    "name": "usename",
                    "type": "text"
                },
                {
                    "name": "application_name",
                    "type": "text"
                },
                {
                    "name": "client_addr",
                    "type": "text"
                },
                {
                    "name": "state",
                    "type": "text"
                },
                {
                    "name": "query",
                    "type": "text"
                },
                {
                    "name": "query_start",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "pg_stat_user_tables",
            "columns": [
                {
                    "name": "relid",
                    "type": "integer"
                },
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "relname",
                    "type": "text"
                },
                {
                    "name": "seq_scan",
                    "type": "integer"
                },
                {
                    "name": "seq_tup_read",
                    "type": "integer"
                },
                {
                    "name": "idx_scan",
                    "type": "integer"
                },
                {
                    "name": "idx_tup_fetch",
                    "type": "integer"
                },
                {
                    "name": "n_tup_ins",
                    "type": "integer"
                },
                {
                    "name": "n_tup_upd",
                    "type": "integer"
                },
                {
                    "name": "n_tup_del",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_stat_database",
            "columns": [
                {
                    "name": "datid",
                    "type": "integer"
                },
                {
                    "name": "datname",
                    "type": "text"
                },
                {
                    "name": "numbackends",
                    "type": "integer"
                },
                {
                    "name": "xact_commit",
                    "type": "integer"
                },
                {
                    "name": "xact_rollback",
                    "type": "integer"
                },
                {
                    "name": "blks_read",
                    "type": "integer"
                },
                {
                    "name": "blks_hit",
                    "type": "integer"
                },
                {
                    "name": "tup_returned",
                    "type": "integer"
                },
                {
                    "name": "tup_fetched",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_roles",
            "columns": [
                {
                    "name": "rolname",
                    "type": "text"
                },
                {
                    "name": "rolsuper",
                    "type": "boolean"
                },
                {
                    "name": "rolinherit",
                    "type": "boolean"
                },
                {
                    "name": "rolcreaterole",
                    "type": "boolean"
                },
                {
                    "name": "rolcreatedb",
                    "type": "boolean"
                },
                {
                    "name": "rolcanlogin",
                    "type": "boolean"
                },
                {
                    "name": "rolconnlimit",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "pg_user",
            "columns": [
                {
                    "name": "usename",
                    "type": "text"
                },
                {
                    "name": "usesysid",
                    "type": "integer"
                },
                {
                    "name": "usecreatedb",
                    "type": "boolean"
                },
                {
                    "name": "usesuper",
                    "type": "boolean"
                },
                {
                    "name": "userepl",
                    "type": "boolean"
                },
                {
                    "name": "usebypassrls",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_database",
            "columns": [
                {
                    "name": "oid",
                    "type": "integer"
                },
                {
                    "name": "datname",
                    "type": "text"
                },
                {
                    "name": "datdba",
                    "type": "integer"
                },
                {
                    "name": "encoding",
                    "type": "text"
                },
                {
                    "name": "datcollate",
                    "type": "text"
                },
                {
                    "name": "datctype",
                    "type": "text"
                },
                {
                    "name": "datistemplate",
                    "type": "boolean"
                },
                {
                    "name": "datallowconn",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "pg_indexes",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "tablename",
                    "type": "text"
                },
                {
                    "name": "indexname",
                    "type": "text"
                },
                {
                    "name": "tablespace",
                    "type": "text"
                },
                {
                    "name": "indexdef",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_views",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "viewname",
                    "type": "text"
                },
                {
                    "name": "viewowner",
                    "type": "text"
                },
                {
                    "name": "definition",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "pg_matviews",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "matviewname",
                    "type": "text"
                },
                {
                    "name": "matviewowner",
                    "type": "text"
                },
                {
                    "name": "tablespace",
                    "type": "text"
                },
                {
                    "name": "ispopulated",
                    "type": "boolean"
                },
                {
                    "name": "definition",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_views",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "viewname",
                    "type": "text"
                },
                {
                    "name": "viewowner",
                    "type": "text"
                },
                {
                    "name": "definition",
                    "type": "text"
                }
            ]
        },
        {
            "name": "pg_matviews",
            "columns": [
                {
                    "name": "schemaname",
                    "type": "text"
                },
                {
                    "name": "matviewname",
                    "type": "text"
                },
                {
                    "name": "matviewowner",
                    "type": "text"
                },
                {
                    "name": "tablespace",
                    "type": "text"
                },
                {
                    "name": "ispopulated",
                    "type": "boolean"
                },
                {
                    "name": "definition",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "processlist",
            "columns": [
                {
                    "name": "ID",
                    "type": "integer"
                },
                {
                    "name": "USER",
                    "type": "text"
                },
                {
                    "name": "HOST",
                    "type": "text"
                },
                {
                    "name": "DB",
                    "type": "text"
                },
                {
                    "name": "COMMAND",
                    "type": "text"
                },
                {
                    "name": "TIME",
                    "type": "integer"
                },
                {
                    "name": "STATE",
                    "type": "text"
                },
                {
                    "name": "INFO",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "mysql",
            "name": "user",
            "columns": [
                {
                    "name": "Host",
                    "type": "text"
                },
                {
                    "name": "User",
                    "type": "text"
                },
                {
                    "name": "Select_priv",
                    "type": "text"
                },
                {
                    "name": "Insert_priv",
                    "type": "text"
                },
                {
                    "name": "Update_priv",
                    "type": "text"
                },
                {
                    "name": "Delete_priv",
                    "type": "text"
                },
                {
                    "name": "Create_priv",
                    "type": "text"
                },
                {
                    "name": "Drop_priv",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "performance_schema",
            "name": "threads",
            "columns": [
                {
                    "name": "THREAD_ID",
                    "type": "integer"
                },
                {
                    "name": "NAME",
                    "type": "text"
                },
                {
                    "name": "TYPE",
                    "type": "text"
                },
                {
                    "name": "PROCESSLIST_ID",
                    "type": "integer"
                },
                {
                    "name": "PROCESSLIST_USER",
                    "type": "text"
                },
                {
                    "name": "PROCESSLIST_HOST",
                    "type": "text"
                },
                {
                    "name": "PROCESSLIST_DB",
                    "type": "text"
                },
                {
                    "name": "PROCESSLIST_COMMAND",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "performance_schema",
            "name": "global_variables",
            "columns": [
                {
                    "name": "VARIABLE_NAME",
                    "type": "text"
                },
                {
                    "name": "VARIABLE_VALUE",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "performance_schema",
            "name": "global_status",
            "columns": [
                {
                    "name": "VARIABLE_NAME",
                    "type": "text"
                },
                {
                    "name": "VARIABLE_VALUE",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "performance_schema",
            "name": "events_statements_summary_by_digest",
            "columns": [
                {
                    "name": "SCHEMA_NAME",
                    "type": "text"
                },
                {
                    "name": "DIGEST",
                    "type": "text"
                },
                {
                    "name": "DIGEST_TEXT",
                    "type": "text"
                },
                {
                    "name": "COUNT_STAR",
                    "type": "integer"
                },
                {
                    "name": "SUM_TIMER_WAIT",
                    "type": "integer"
                },
                {
                    "name": "MIN_TIMER_WAIT",
                    "type": "integer"
                },
                {
                    "name": "AVG_TIMER_WAIT",
                    "type": "integer"
                },
                {
                    "name": "MAX_TIMER_WAIT",
                    "type": "integer"
                },
                {
                    "name": "SUM_ROWS_AFFECTED",
                    "type": "integer"
                },
                {
                    "name": "SUM_ROWS_SENT",
                    "type": "integer"
                },
                {
                    "name": "SUM_ROWS_EXAMINED",
                    "type": "integer"
                },
                {
                    "name": "FIRST_SEEN",
                    "type": "timestamp"
                },
                {
                    "name": "LAST_SEEN",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "information_schema",
            "name": "events",
            "columns": [
                {
                    "name": "EVENT_CATALOG",
                    "type": "text"
                },
                {
                    "name": "EVENT_SCHEMA",
                    "type": "text"
                },
                {
                    "name": "EVENT_NAME",
                    "type": "text"
                },
                {
                    "name": "DEFINER",
                    "type": "text"
                },
                {
                    "name": "TIME_ZONE",
                    "type": "text"
                },
                {
                    "name": "EVENT_BODY",
                    "type": "text"
                },
                {
                    "name": "EVENT_DEFINITION",
                    "type": "text"
                },
                {
                    "name": "EVENT_TYPE",
                    "type": "text"
                },
                {
                    "name": "STATUS",
                    "type": "text"
                },
                {
                    "name": "CREATED",
                    "type": "timestamp"
                },
                {
                    "name": "LAST_ALTERED",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "schema_table_statistics",
            "columns": [
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "total_latency",
                    "type": "integer"
                },
                {
                    "name": "rows_fetched",
                    "type": "integer"
                },
                {
                    "name": "rows_inserted",
                    "type": "integer"
                },
                {
                    "name": "rows_updated",
                    "type": "integer"
                },
                {
                    "name": "rows_deleted",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "tables",
            "columns": [
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "schema_id",
                    "type": "integer"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "type_desc",
                    "type": "text"
                },
                {
                    "name": "create_date",
                    "type": "timestamp"
                },
                {
                    "name": "modify_date",
                    "type": "timestamp"
                },
                {
                    "name": "is_ms_shipped",
                    "type": "boolean"
                },
                {
                    "name": "is_filetable",
                    "type": "boolean"
                },
                {
                    "name": "is_memory_optimized",
                    "type": "boolean"
                },
                {
                    "name": "max_column_id_used",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "columns",
            "columns": [
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "column_id",
                    "type": "integer"
                },
                {
                    "name": "system_type_id",
                    "type": "integer"
                },
                {
                    "name": "user_type_id",
                    "type": "integer"
                },
                {
                    "name": "max_length",
                    "type": "integer"
                },
                {
                    "name": "precision",
                    "type": "integer"
                },
                {
                    "name": "scale",
                    "type": "integer"
                },
                {
                    "name": "collation_name",
                    "type": "text"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "is_identity",
                    "type": "boolean"
                },
                {
                    "name": "is_computed",
                    "type": "boolean"
                },
                {
                    "name": "is_rowguidcol",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "objects",
            "columns": [
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "schema_id",
                    "type": "integer"
                },
                {
                    "name": "parent_object_id",
                    "type": "integer"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "type_desc",
                    "type": "text"
                },
                {
                    "name": "create_date",
                    "type": "timestamp"
                },
                {
                    "name": "modify_date",
                    "type": "timestamp"
                },
                {
                    "name": "is_ms_shipped",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "schemas",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "schema_id",
                    "type": "integer"
                },
                {
                    "name": "principal_id",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "databases",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "database_id",
                    "type": "integer"
                },
                {
                    "name": "source_database_id",
                    "type": "integer"
                },
                {
                    "name": "owner_sid",
                    "type": "text"
                },
                {
                    "name": "create_date",
                    "type": "timestamp"
                },
                {
                    "name": "compatibility_level",
                    "type": "integer"
                },
                {
                    "name": "collation_name",
                    "type": "text"
                },
                {
                    "name": "user_access_desc",
                    "type": "text"
                },
                {
                    "name": "is_read_only",
                    "type": "boolean"
                },
                {
                    "name": "is_auto_close_on",
                    "type": "boolean"
                },
                {
                    "name": "state_desc",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "types",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "system_type_id",
                    "type": "integer"
                },
                {
                    "name": "user_type_id",
                    "type": "integer"
                },
                {
                    "name": "schema_id",
                    "type": "integer"
                },
                {
                    "name": "principal_id",
                    "type": "integer"
                },
                {
                    "name": "max_length",
                    "type": "integer"
                },
                {
                    "name": "precision",
                    "type": "integer"
                },
                {
                    "name": "scale",
                    "type": "integer"
                },
                {
                    "name": "collation_name",
                    "type": "text"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "is_user_defined",
                    "type": "boolean"
                },
                {
                    "name": "is_assembly_type",
                    "type": "boolean"
                },
                {
                    "name": "is_table_type",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "dm_exec_sessions",
            "columns": [
                {
                    "name": "session_id",
                    "type": "integer"
                },
                {
                    "name": "login_time",
                    "type": "timestamp"
                },
                {
                    "name": "host_name",
                    "type": "text"
                },
                {
                    "name": "program_name",
                    "type": "text"
                },
                {
                    "name": "login_name",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "cpu_time",
                    "type": "integer"
                },
                {
                    "name": "memory_usage",
                    "type": "integer"
                },
                {
                    "name": "total_scheduled_time",
                    "type": "integer"
                },
                {
                    "name": "total_elapsed_time",
                    "type": "integer"
                },
                {
                    "name": "reads",
                    "type": "integer"
                },
                {
                    "name": "writes",
                    "type": "integer"
                },
                {
                    "name": "logical_reads",
                    "type": "integer"
                },
                {
                    "name": "last_request_start_time",
                    "type": "timestamp"
                },
                {
                    "name": "last_request_end_time",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "dm_exec_requests",
            "columns": [
                {
                    "name": "session_id",
                    "type": "integer"
                },
                {
                    "name": "request_id",
                    "type": "integer"
                },
                {
                    "name": "start_time",
                    "type": "timestamp"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "command",
                    "type": "text"
                },
                {
                    "name": "database_id",
                    "type": "integer"
                },
                {
                    "name": "user_id",
                    "type": "integer"
                },
                {
                    "name": "blocking_session_id",
                    "type": "integer"
                },
                {
                    "name": "wait_type",
                    "type": "text"
                },
                {
                    "name": "wait_time",
                    "type": "integer"
                },
                {
                    "name": "cpu_time",
                    "type": "integer"
                },
                {
                    "name": "total_elapsed_time",
                    "type": "integer"
                },
                {
                    "name": "reads",
                    "type": "integer"
                },
                {
                    "name": "writes",
                    "type": "integer"
                },
                {
                    "name": "logical_reads",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "indexes",
            "columns": [
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "index_id",
                    "type": "integer"
                },
                {
                    "name": "type_desc",
                    "type": "text"
                },
                {
                    "name": "is_unique",
                    "type": "boolean"
                },
                {
                    "name": "is_primary_key",
                    "type": "boolean"
                },
                {
                    "name": "is_unique_constraint",
                    "type": "boolean"
                },
                {
                    "name": "is_disabled",
                    "type": "boolean"
                },
                {
                    "name": "modify_date",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "foreign_keys",
            "columns": [
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "parent_object_id",
                    "type": "integer"
                },
                {
                    "name": "referenced_object_id",
                    "type": "integer"
                },
                {
                    "name": "is_disabled",
                    "type": "boolean"
                },
                {
                    "name": "is_not_trusted",
                    "type": "boolean"
                },
                {
                    "name": "delete_referential_action_desc",
                    "type": "text"
                },
                {
                    "name": "update_referential_action_desc",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "dm_exec_connections",
            "columns": [
                {
                    "name": "session_id",
                    "type": "integer"
                },
                {
                    "name": "connect_time",
                    "type": "timestamp"
                },
                {
                    "name": "net_transport",
                    "type": "text"
                },
                {
                    "name": "protocol_type",
                    "type": "text"
                },
                {
                    "name": "auth_scheme",
                    "type": "text"
                },
                {
                    "name": "num_reads",
                    "type": "integer"
                },
                {
                    "name": "num_writes",
                    "type": "integer"
                },
                {
                    "name": "client_net_address",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "tables",
            "columns": [
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "engine",
                    "type": "text"
                },
                {
                    "name": "is_temporary",
                    "type": "boolean"
                },
                {
                    "name": "total_rows",
                    "type": "integer"
                },
                {
                    "name": "total_bytes",
                    "type": "integer"
                },
                {
                    "name": "metadata_path",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "columns",
            "columns": [
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "table",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "default_kind",
                    "type": "text"
                },
                {
                    "name": "default_expression",
                    "type": "text"
                },
                {
                    "name": "comment",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "functions",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "is_aggregate",
                    "type": "boolean"
                },
                {
                    "name": "case_insensitive",
                    "type": "text"
                },
                {
                    "name": "alias_to",
                    "type": "text"
                },
                {
                    "name": "create_query",
                    "type": "timestamp"
                },
                {
                    "name": "origin",
                    "type": "text"
                },
                {
                    "name": "description",
                    "type": "text"
                },
                {
                    "name": "syntax",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "databases",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "engine",
                    "type": "text"
                },
                {
                    "name": "data_path",
                    "type": "text"
                },
                {
                    "name": "metadata_path",
                    "type": "text"
                },
                {
                    "name": "uuid",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "parts",
            "columns": [
                {
                    "name": "partition",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "table",
                    "type": "text"
                },
                {
                    "name": "active",
                    "type": "boolean"
                },
                {
                    "name": "marks",
                    "type": "integer"
                },
                {
                    "name": "rows",
                    "type": "integer"
                },
                {
                    "name": "bytes_on_disk",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "system",
            "name": "processes",
            "columns": [
                {
                    "name": "is_initial_query",
                    "type": "boolean"
                },
                {
                    "name": "user",
                    "type": "text"
                },
                {
                    "name": "query_id",
                    "type": "text"
                },
                {
                    "name": "address",
                    "type": "text"
                },
                {
                    "name": "elapsed",
                    "type": "integer"
                },
                {
                    "name": "read_rows",
                    "type": "integer"
                },
                {
                    "name": "read_bytes",
                    "type": "integer"
                },
                {
                    "name": "query",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "merges",
            "columns": [
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "table",
                    "type": "text"
                },
                {
                    "name": "elapsed",
                    "type": "integer"
                },
                {
                    "name": "progress",
                    "type": "decimal"
                },
                {
                    "name": "num_parts",
                    "type": "integer"
                },
                {
                    "name": "result_part_name",
                    "type": "text"
                },
                {
                    "name": "partition_id",
                    "type": "text"
                },
                {
                    "name": "is_mutation",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "system",
            "name": "mutations",
            "columns": [
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "table",
                    "type": "text"
                },
                {
                    "name": "mutation_id",
                    "type": "text"
                },
                {
                    "name": "command",
                    "type": "text"
                },
                {
                    "name": "create_time",
                    "type": "timestamp"
                },
                {
                    "name": "parts_to_do",
                    "type": "integer"
                },
                {
                    "name": "is_done",
                    "type": "boolean"
                },
                {
                    "name": "latest_failed_part",
                    "type": "text"
                },
                {
                    "name": "latest_fail_reason",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "settings",
            "columns": [
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "value",
                    "type": "text"
                },
                {
                    "name": "changed",
                    "type": "boolean"
                },
                {
                    "name": "description",
                    "type": "text"
                },
                {
                    "name": "min",
                    "type": "text"
                },
                {
                    "name": "max",
                    "type": "text"
                },
                {
                    "name": "readonly",
                    "type": "boolean"
                },
                {
                    "name": "type",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "system",
            "name": "query_log",
            "columns": [
                {
                    "name": "hostname",
                    "type": "text"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "event_time",
                    "type": "timestamp"
                },
                {
                    "name": "query_duration_ms",
                    "type": "integer"
                },
                {
                    "name": "read_rows",
                    "type": "integer"
                },
                {
                    "name": "read_bytes",
                    "type": "integer"
                },
                {
                    "name": "written_rows",
                    "type": "integer"
                },
                {
                    "name": "written_bytes",
                    "type": "integer"
                },
                {
                    "name": "query",
                    "type": "text"
                },
                {
                    "name": "query_id",
                    "type": "text"
                },
                {
                    "name": "user",
                    "type": "text"
                },
                {
                    "name": "database",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "svv",
            "name": "tables",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "remarks",
                    "type": "text"
                }
            ]
        },
        {
            "name": "svv_tables",
            "columns": [
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "remarks",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "pg_catalog",
            "name": "svv_tables",
            "columns": [
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "tablename",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "remarks",
                    "type": "text"
                }
            ]
        },
        {
            "name": "svv_columns",
            "columns": [
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "svv_redshift_tables",
            "columns": [
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "remarks",
                    "type": "text"
                }
            ]
        },
        {
            "name": "stv_recents",
            "columns": [
                {
                    "name": "userid",
                    "type": "integer"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "starttime",
                    "type": "timestamp"
                },
                {
                    "name": "query",
                    "type": "text"
                },
                {
                    "name": "user_name",
                    "type": "text"
                },
                {
                    "name": "db_name",
                    "type": "text"
                }
            ]
        },
        {
            "name": "stv_sessions",
            "columns": [
                {
                    "name": "userid",
                    "type": "integer"
                },
                {
                    "name": "process",
                    "type": "integer"
                },
                {
                    "name": "user_name",
                    "type": "text"
                },
                {
                    "name": "db_name",
                    "type": "text"
                },
                {
                    "name": "timeout_sec",
                    "type": "integer"
                },
                {
                    "name": "starttime",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "stl_query",
            "columns": [
                {
                    "name": "userid",
                    "type": "integer"
                },
                {
                    "name": "query",
                    "type": "integer"
                },
                {
                    "name": "pid",
                    "type": "integer"
                },
                {
                    "name": "xid",
                    "type": "integer"
                },
                {
                    "name": "database",
                    "type": "text"
                },
                {
                    "name": "starttime",
                    "type": "timestamp"
                },
                {
                    "name": "endtime",
                    "type": "timestamp"
                },
                {
                    "name": "aborted",
                    "type": "boolean"
                },
                {
                    "name": "label",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "all",
            "name": "tables",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "tablespace_name",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "all_tables",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "tablespace_name",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "all_tab_columns",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "data_length",
                    "type": "integer"
                },
                {
                    "name": "data_precision",
                    "type": "integer"
                },
                {
                    "name": "data_scale",
                    "type": "integer"
                },
                {
                    "name": "nullable",
                    "type": "text"
                },
                {
                    "name": "column_id",
                    "type": "integer"
                },
                {
                    "name": "data_default",
                    "type": "text"
                }
            ]
        },
        {
            "name": "user_tables",
            "columns": [
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "tablespace_name",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                },
                {
                    "name": "blocks",
                    "type": "integer"
                },
                {
                    "name": "empty_blocks",
                    "type": "integer"
                },
                {
                    "name": "avg_space",
                    "type": "integer"
                },
                {
                    "name": "last_analyzed",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "all_users",
            "columns": [
                {
                    "name": "username",
                    "type": "text"
                },
                {
                    "name": "user_id",
                    "type": "integer"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "common",
                    "type": "text"
                },
                {
                    "name": "oracle_maintained",
                    "type": "text"
                },
                {
                    "name": "inherited",
                    "type": "text"
                },
                {
                    "name": "default_collation",
                    "type": "text"
                },
                {
                    "name": "implicit",
                    "type": "text"
                },
                {
                    "name": "all_shard",
                    "type": "text"
                }
            ]
        },
        {
            "name": "all_objects",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "object_name",
                    "type": "text"
                },
                {
                    "name": "subobject_name",
                    "type": "text"
                },
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "data_object_id",
                    "type": "integer"
                },
                {
                    "name": "object_type",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_ddl_time",
                    "type": "timestamp"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "temporary",
                    "type": "boolean"
                },
                {
                    "name": "generated",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "all_views",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "view_name",
                    "type": "text"
                },
                {
                    "name": "text",
                    "type": "text"
                },
                {
                    "name": "text_length",
                    "type": "integer"
                },
                {
                    "name": "type_text",
                    "type": "text"
                },
                {
                    "name": "type_text_length",
                    "type": "integer"
                },
                {
                    "name": "oid_text",
                    "type": "text"
                },
                {
                    "name": "oid_text_length",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "all_constraints",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "constraint_name",
                    "type": "text"
                },
                {
                    "name": "constraint_type",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "search_condition",
                    "type": "text"
                },
                {
                    "name": "r_owner",
                    "type": "text"
                },
                {
                    "name": "r_constraint_name",
                    "type": "text"
                },
                {
                    "name": "delete_rule",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "deferrable",
                    "type": "boolean"
                },
                {
                    "name": "deferred",
                    "type": "boolean"
                },
                {
                    "name": "validated",
                    "type": "boolean"
                },
                {
                    "name": "last_change",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "user_constraints",
            "columns": [
                {
                    "name": "constraint_name",
                    "type": "text"
                },
                {
                    "name": "constraint_type",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "search_condition",
                    "type": "text"
                },
                {
                    "name": "r_owner",
                    "type": "text"
                },
                {
                    "name": "r_constraint_name",
                    "type": "text"
                },
                {
                    "name": "delete_rule",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "deferrable",
                    "type": "boolean"
                },
                {
                    "name": "deferred",
                    "type": "boolean"
                },
                {
                    "name": "validated",
                    "type": "boolean"
                },
                {
                    "name": "last_change",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "user_objects",
            "columns": [
                {
                    "name": "object_name",
                    "type": "text"
                },
                {
                    "name": "subobject_name",
                    "type": "text"
                },
                {
                    "name": "object_id",
                    "type": "integer"
                },
                {
                    "name": "object_type",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_ddl_time",
                    "type": "timestamp"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "temporary",
                    "type": "boolean"
                },
                {
                    "name": "generated",
                    "type": "boolean"
                }
            ]
        },
        {
            "name": "user_tab_columns",
            "columns": [
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "data_length",
                    "type": "integer"
                },
                {
                    "name": "column_id",
                    "type": "integer"
                },
                {
                    "name": "nullable",
                    "type": "text"
                }
            ]
        },
        {
            "name": "user_indexes",
            "columns": [
                {
                    "name": "index_name",
                    "type": "text"
                },
                {
                    "name": "index_type",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "uniqueness",
                    "type": "text"
                },
                {
                    "name": "compression",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "blevel",
                    "type": "integer"
                },
                {
                    "name": "leaf_blocks",
                    "type": "integer"
                },
                {
                    "name": "distinct_keys",
                    "type": "integer"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                },
                {
                    "name": "last_analyzed",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "user_ind_columns",
            "columns": [
                {
                    "name": "index_name",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "column_position",
                    "type": "integer"
                },
                {
                    "name": "column_length",
                    "type": "integer"
                },
                {
                    "name": "descend",
                    "type": "text"
                }
            ]
        },
        {
            "name": "dba_tables",
            "columns": [
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "tablespace_name",
                    "type": "text"
                },
                {
                    "name": "cluster_name",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                },
                {
                    "name": "blocks",
                    "type": "integer"
                },
                {
                    "name": "empty_blocks",
                    "type": "integer"
                },
                {
                    "name": "last_analyzed",
                    "type": "timestamp"
                }
            ]
        },
        {
            "name": "dual",
            "columns": [
                {
                    "name": "dummy",
                    "type": "text"
                }
            ]
        },
        {
            "name": "v$session",
            "columns": [
                {
                    "name": "sid",
                    "type": "integer"
                },
                {
                    "name": "serial#",
                    "type": "integer"
                },
                {
                    "name": "username",
                    "type": "text"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "machine",
                    "type": "text"
                },
                {
                    "name": "program",
                    "type": "text"
                }
            ]
        },
        {
            "name": "exa_all_tables",
            "columns": [
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_type",
                    "type": "text"
                },
                {
                    "name": "table_owner",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_commit",
                    "type": "timestamp"
                },
                {
                    "name": "has_distribution_key",
                    "type": "boolean"
                },
                {
                    "name": "delete_percentage",
                    "type": "text"
                }
            ]
        },
        {
            "name": "exa_all_columns",
            "columns": [
                {
                    "name": "column_schema",
                    "type": "text"
                },
                {
                    "name": "column_table",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "column_ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "column_default",
                    "type": "text"
                },
                {
                    "name": "column_is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "column_type",
                    "type": "text"
                },
                {
                    "name": "column_maxsize",
                    "type": "integer"
                },
                {
                    "name": "column_num_prec",
                    "type": "integer"
                },
                {
                    "name": "column_num_scale",
                    "type": "integer"
                },
                {
                    "name": "column_comment",
                    "type": "text"
                }
            ]
        },
        {
            "name": "__TABLES__",
            "columns": [
                {
                    "name": "project_id",
                    "type": "integer"
                },
                {
                    "name": "dataset_id",
                    "type": "integer"
                },
                {
                    "name": "table_id",
                    "type": "integer"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "last_modified_time",
                    "type": "timestamp"
                },
                {
                    "name": "row_count",
                    "type": "integer"
                },
                {
                    "name": "size_bytes",
                    "type": "integer"
                }
            ]
        },
        {
            "name": "__TABLES_SUMMARY__",
            "columns": [
                {
                    "name": "project_id",
                    "type": "integer"
                },
                {
                    "name": "dataset_id",
                    "type": "integer"
                },
                {
                    "name": "table_id",
                    "type": "integer"
                },
                {
                    "name": "creation_time",
                    "type": "timestamp"
                },
                {
                    "name": "last_modified_time",
                    "type": "timestamp"
                },
                {
                    "name": "row_count",
                    "type": "integer"
                },
                {
                    "name": "size_bytes",
                    "type": "integer"
                },
                {
                    "name": "type",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "query_history",
            "columns": [
                {
                    "name": "query_id",
                    "type": "text"
                },
                {
                    "name": "query_text",
                    "type": "text"
                },
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "user_name",
                    "type": "text"
                },
                {
                    "name": "start_time",
                    "type": "timestamp"
                },
                {
                    "name": "end_time",
                    "type": "timestamp"
                },
                {
                    "name": "total_elapsed_time",
                    "type": "integer"
                },
                {
                    "name": "execution_status",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "users",
            "columns": [
                {
                    "name": "id",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "created_on",
                    "type": "timestamp"
                },
                {
                    "name": "login_name",
                    "type": "text"
                },
                {
                    "name": "display_name",
                    "type": "text"
                },
                {
                    "name": "email",
                    "type": "text"
                },
                {
                    "name": "deleted",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "roles",
            "columns": [
                {
                    "name": "id",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "created_on",
                    "type": "timestamp"
                },
                {
                    "name": "owner",
                    "type": "text"
                },
                {
                    "name": "comment",
                    "type": "text"
                },
                {
                    "name": "deleted",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "warehouses",
            "columns": [
                {
                    "name": "id",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "created_on",
                    "type": "timestamp"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "size",
                    "type": "text"
                },
                {
                    "name": "auto_resume",
                    "type": "boolean"
                },
                {
                    "name": "auto_suspend",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "tables",
            "columns": [
                {
                    "name": "id",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                },
                {
                    "name": "row_count",
                    "type": "integer"
                },
                {
                    "name": "bytes",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "databases",
            "columns": [
                {
                    "name": "database_id",
                    "type": "text"
                },
                {
                    "name": "database_name",
                    "type": "text"
                },
                {
                    "name": "database_owner",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                },
                {
                    "name": "deleted",
                    "type": "boolean"
                },
                {
                    "name": "comment",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "schemata",
            "columns": [
                {
                    "name": "catalog_id",
                    "type": "text"
                },
                {
                    "name": "catalog_name",
                    "type": "text"
                },
                {
                    "name": "schema_id",
                    "type": "text"
                },
                {
                    "name": "schema_name",
                    "type": "text"
                },
                {
                    "name": "schema_owner",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                },
                {
                    "name": "deleted",
                    "type": "boolean"
                },
                {
                    "name": "comment",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "columns",
            "columns": [
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "table_name",
                    "type": "text"
                },
                {
                    "name": "column_name",
                    "type": "text"
                },
                {
                    "name": "ordinal_position",
                    "type": "integer"
                },
                {
                    "name": "column_default",
                    "type": "text"
                },
                {
                    "name": "is_nullable",
                    "type": "boolean"
                },
                {
                    "name": "data_type",
                    "type": "text"
                },
                {
                    "name": "created",
                    "type": "timestamp"
                },
                {
                    "name": "last_altered",
                    "type": "timestamp"
                }
            ]
        },
        {
            "schema": "account_usage",
            "name": "grants_to_roles",
            "columns": [
                {
                    "name": "created_on",
                    "type": "timestamp"
                },
                {
                    "name": "modified_on",
                    "type": "timestamp"
                },
                {
                    "name": "privilege",
                    "type": "text"
                },
                {
                    "name": "granted_on",
                    "type": "text"
                },
                {
                    "name": "name",
                    "type": "text"
                },
                {
                    "name": "table_catalog",
                    "type": "text"
                },
                {
                    "name": "table_schema",
                    "type": "text"
                },
                {
                    "name": "granted_to",
                    "type": "text"
                },
                {
                    "name": "grantee_name",
                    "type": "text"
                },
                {
                    "name": "grant_option",
                    "type": "text"
                },
                {
                    "name": "granted_by",
                    "type": "text"
                },
                {
                    "name": "deleted",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "segments",
            "columns": [
                {
                    "name": "segment_id",
                    "type": "text"
                },
                {
                    "name": "datasource",
                    "type": "text"
                },
                {
                    "name": "start",
                    "type": "timestamp"
                },
                {
                    "name": "end",
                    "type": "timestamp"
                },
                {
                    "name": "size",
                    "type": "integer"
                },
                {
                    "name": "num_rows",
                    "type": "integer"
                },
                {
                    "name": "is_published",
                    "type": "boolean"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "servers",
            "columns": [
                {
                    "name": "server",
                    "type": "text"
                },
                {
                    "name": "host",
                    "type": "text"
                },
                {
                    "name": "plaintext_port",
                    "type": "integer"
                },
                {
                    "name": "tls_port",
                    "type": "integer"
                },
                {
                    "name": "curr_size",
                    "type": "text"
                },
                {
                    "name": "max_size",
                    "type": "integer"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "tasks",
            "columns": [
                {
                    "name": "task_id",
                    "type": "text"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "datasource",
                    "type": "text"
                },
                {
                    "name": "created_time",
                    "type": "timestamp"
                },
                {
                    "name": "status",
                    "type": "text"
                },
                {
                    "name": "location",
                    "type": "text"
                }
            ]
        },
        {
            "schema": "sys",
            "name": "supervisors",
            "columns": [
                {
                    "name": "supervisor_id",
                    "type": "text"
                },
                {
                    "name": "state",
                    "type": "text"
                },
                {
                    "name": "detailed_state",
                    "type": "text"
                },
                {
                    "name": "healthy",
                    "type": "text"
                },
                {
                    "name": "type",
                    "type": "text"
                },
                {
                    "name": "source",
                    "type": "text"
                }
            ]
        }
    ],
    describeFunctionColumns: [
      { name: 'Name', type: 'text' },
      { name: 'Description', type: 'text' },
    ],
    explainColumns: [
      { name: 'addr', type: 'integer' },
      { name: 'opcode', type: 'text' },
      { name: 'p1', type: 'integer' },
      { name: 'p2', type: 'integer' },
      { name: 'p3', type: 'integer' },
      { name: 'p4', type: 'text' },
      { name: 'p5', type: 'integer' },
      { name: 'comment', type: 'text' },
    ],
    snowflakeDescribeObjectColumns: {},
    showTableListingColumns: [
      { name: 'created_on', type: 'timestamp' },
      { name: 'name', type: 'text' },
      { name: 'database_name', type: 'text' },
      { name: 'schema_name', type: 'text' },
      { name: 'kind', type: 'text' },
      { name: 'comment', type: 'text' },
      { name: 'cluster_by', type: 'text' },
      { name: 'rows', type: 'integer' },
      { name: 'bytes', type: 'integer' },
      { name: 'owner', type: 'text' },
      { name: 'retention_time', type: 'integer' },
      { name: 'automatic_clustering', type: 'text' },
      { name: 'change_tracking', type: 'boolean' },
      { name: 'search_optimization', type: 'boolean' },
    ],
    commandResultColumns: [
      {
        pattern: '/^(?:list|ls)\\s+@/',
        columns: [
          { name: 'name', type: 'text' },
          { name: 'size', type: 'integer' },
          { name: 'md5', type: 'text' },
          { name: 'last_modified', type: 'timestamp' },
        ],
      },
      {
        pattern: '/^get\\s+@/',
        columns: [
          { name: 'file', type: 'text' },
          { name: 'size', type: 'integer' },
          { name: 'status', type: 'text' },
          { name: 'message', type: 'text' },
        ],
      },
      {
        pattern: '/^(?:remove|rm)\\s+@/',
        columns: [
          { name: 'name', type: 'text' },
          { name: 'result', type: 'text' },
        ],
      },
      {
        pattern: '/^list\\s+(?:file|jar|archive)\\b/',
        columns: [
          { name: 'resource', type: 'text' },
        ],
      },
    ],
  },
  diagnosticRules: {
    knownTableFunctionArgumentNames: [
      'file',
      'url',
    ],
    virtualTableArgumentNames: [
      'highlight',
      'snippet',
      'bm25',
      'fts5vocab',
    ],
    suppressSqliteRowid: true,
  },
} satisfies DialectConfig;
