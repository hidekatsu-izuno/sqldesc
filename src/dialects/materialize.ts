import type { DialectConfig } from "../types.js";

export const dialectConfig = {
  name: "materialize",
  aliases: [],
  family: "postgresql",
  typeFamily: "postgresql",
  displayTypes: {
    bigint: "bigint",
    blob: "bytea",
    boolean: "boolean",
    bytes: "bytea",
    clob: "text",
    date: "date",
    datetime: "timestamp",
    decimal: "numeric",
    double: "numeric",
    integer: "integer",
    json: "json",
    jsonb: "jsonb",
    nclob: "text",
    postgres_varchar: "character varying",
    text: "text",
    time: "time",
    timestamp: "timestamp without time zone",
    timestamptz: "timestamp with time zone",
    uuid: "uuid",
  },
  jdbcTypeMap: {
    ARRAY: "array<variant>",
    BIGINT: "bigint",
    BINARY: "bytes",
    BIT: "boolean",
    BLOB: "bytes",
    BOOLEAN: "boolean",
    CHAR: "text",
    CLOB: "text",
    DATALINK: "text",
    DATE: "date",
    DECIMAL: "decimal",
    DISTINCT: "variant",
    DOUBLE: "decimal",
    FLOAT: "decimal",
    INTEGER: "integer",
    JAVA_OBJECT: "json",
    LONGNVARCHAR: "text",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    NCHAR: "text",
    NCLOB: "text",
    NULL: "unknown",
    NUMERIC: "decimal",
    NVARCHAR: "text",
    OTHER: "json",
    REAL: "decimal",
    REF: "variant",
    REF_CURSOR: "variant",
    ROWID: "text",
    SMALLINT: "integer",
    SQLXML: "xml",
    STRUCT: "struct<>",
    TIME: "time",
    TIMESTAMP: "timestamp",
    TIMESTAMP_WITH_TIMEZONE: "timestamp",
    TIME_WITH_TIMEZONE: "time",
    TINYINT: "integer",
    VARBINARY: "bytes",
    VARCHAR: "text",
  },
  scalarFunctionTypes: {
    age: "interval",
    array_all: "boolean",
    array_any: "boolean",
    array_contains: "boolean",
    array_join: "text",
    array_length: "integer",
    array_lower: "integer",
    array_ndims: "integer",
    array_position: "integer",
    array_size: "integer",
    array_sum: "integer",
    array_to_string: "text",
    array_upper: "integer",
    as_array: "array<variant>",
    as_object: "object",
    as_varchar: "text",
    ascii: "integer",
    bit_length: "integer",
    byte_length: "integer",
    cardinality: "integer",
    cbrt: "decimal",
    char_length: "integer",
    character_length: "integer",
    contains: "boolean",
    convert_to: "bytes",
    cos: "decimal",
    current_catalog: "text",
    current_database: "text",
    current_datetime: "datetime",
    current_schema: "text",
    current_user: "text",
    currval: "bigint",
    date_parse: "timestamp",
    datetime: "datetime",
    day: "integer",
    degrees: "decimal",
    ends_with: "boolean",
    exp: "decimal",
    factorial: "integer",
    format_date: "text",
    from_base64: "bytes",
    gen_random_uuid: "uuid",
    generate_uuid: "uuid",
    grouping: "integer",
    grouping_id: "integer",
    hash: "integer",
    hex: "text",
    highlight: "text",
    hll_hash: "hll",
    hour: "integer",
    ieee_divide: "decimal",
    initcap: "text",
    instr: "integer",
    json_contains: "boolean",
    json_insert: "json",
    json_patch: "json",
    json_query: "json",
    json_query_array: "array<json>",
    json_remove: "json",
    json_replace: "json",
    json_set: "json",
    json_valid: "boolean",
    json_value: "text",
    json_value_array: "array<text>",
    jsonlength: "integer",
    julianday: "decimal",
    lastval: "bigint",
    length: "integer",
    list_contains: "boolean",
    ln: "decimal",
    locate: "integer",
    log: "decimal",
    log10: "decimal",
    lower: "text",
    ltrim: "text",
    md5: "text",
    minute: "integer",
    month: "integer",
    months_between: "decimal",
    newid: "uuid",
    nextval: "bigint",
    octet_length: "integer",
    overlay: "text",
    parse_json: "json",
    pi: "decimal",
    position: "integer",
    pow: "decimal",
    power: "decimal",
    printf: "text",
    quarter: "integer",
    radians: "decimal",
    rand: "decimal",
    random: "decimal",
    regexp_contains: "boolean",
    regexp_count: "integer",
    regexp_extract: "text",
    regexp_extract_all: "array<text>",
    regexp_instr: "integer",
    regexp_like: "boolean",
    regexp_match: "array<text>",
    regexp_matches: "array<text>",
    regexp_position: "integer",
    regexp_replace: "text",
    regexp_split: "array<text>",
    regexp_split_to_array: "array<text>",
    regexp_split_to_table: "text",
    regexp_substr: "text",
    replace: "text",
    rlike: "boolean",
    row_to_json: "json",
    rtrim: "text",
    safe_divide: "decimal",
    scope_identity: "integer",
    second: "integer",
    setval: "bigint",
    sha: "text",
    sha1: "text",
    sha224: "bytes",
    sha256: "bytes",
    sha384: "bytes",
    sha512: "bytes",
    sign: "integer",
    sin: "decimal",
    snippet: "text",
    split: "array<text>",
    split_part: "text",
    sqlite_version: "text",
    sqrt: "decimal",
    st_area: "decimal",
    st_asbinary: "bytes",
    st_asgeojson: "text",
    st_astext: "text",
    st_aswkb: "bytes",
    st_aswkt: "text",
    st_contains: "boolean",
    st_dimension: "integer",
    st_distance: "decimal",
    st_geogpoint: "geography",
    st_intersects: "boolean",
    st_length: "decimal",
    st_makeenvelope: "geometry",
    st_makepoint: "geometry",
    st_ndims: "integer",
    st_npoints: "integer",
    st_point: "geometry",
    st_srid: "integer",
    st_within: "boolean",
    st_x: "decimal",
    st_y: "decimal",
    starts_with: "boolean",
    str_split: "array<text>",
    string_to_array: "array<text>",
    strpos: "integer",
    substr: "text",
    substring: "text",
    tan: "decimal",
    time: "time",
    timestamp: "timestamp",
    to_array: "array<variant>",
    to_binary: "bytes",
    to_bitmap: "bitmap",
    to_boolean: "boolean",
    to_char: "text",
    to_decimal: "decimal",
    to_geography: "geography",
    to_geometry: "geometry",
    to_hex: "text",
    to_number: "decimal",
    to_object: "object",
    to_utf8: "bytes",
    to_variant: "variant",
    todate: "date",
    trim: "text",
    try_to_boolean: "boolean",
    try_to_decimal: "decimal",
    try_to_number: "decimal",
    typeof: "text",
    unhex: "bytes",
    upper: "text",
    user: "text",
    uuid: "uuid",
    uuid_string: "uuid",
    version: "text",
    week: "integer",
    xxhash64: "integer",
    year: "integer",
  },
  scalarFunctionTypePatterns: {},
  tableFunctions: {
    aclexplode: [
      {
        name: "grantor",
        type: "oid",
      },
      {
        name: "grantee",
        type: "oid",
      },
      {
        name: "privilege_type",
        type: "text",
      },
      {
        name: "is_grantable",
        type: "boolean",
      },
    ],
    current_setting: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    generate_subscripts: [
      {
        name: "$alias",
        type: "integer",
      },
    ],
    json_array_elements: [
      {
        name: "$alias",
        type: "json",
      },
    ],
    json_array_elements_text: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    json_each: [
      {
        name: "key",
        type: "text",
      },
      {
        name: "value",
        type: "json",
      },
      {
        name: "type",
        type: "text",
      },
      {
        name: "atom",
        type: "json",
      },
      {
        name: "id",
        type: "integer",
      },
      {
        name: "parent",
        type: "integer",
      },
      {
        name: "fullkey",
        type: "text",
      },
      {
        name: "path",
        type: "text",
      },
    ],
    json_each_text: [
      {
        name: "key",
        type: "text",
      },
      {
        name: "value",
        type: "text",
      },
    ],
    json_object_keys: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    jsonb_array_elements: [
      {
        name: "$alias",
        type: "json",
      },
    ],
    jsonb_array_elements_text: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    jsonb_each: [
      {
        name: "key",
        type: "text",
      },
      {
        name: "value",
        type: "json",
      },
    ],
    jsonb_each_text: [
      {
        name: "key",
        type: "text",
      },
      {
        name: "value",
        type: "text",
      },
    ],
    jsonb_object_keys: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    pg_available_extension_versions: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "version",
        type: "text",
      },
      {
        name: "installed",
        type: "boolean",
      },
      {
        name: "superuser",
        type: "boolean",
      },
      {
        name: "trusted",
        type: "boolean",
      },
      {
        name: "relocatable",
        type: "boolean",
      },
      {
        name: "schema",
        type: "text",
      },
      {
        name: "requires",
        type: "array<text>",
      },
      {
        name: "comment",
        type: "text",
      },
    ],
    pg_get_keywords: [
      {
        name: "word",
        type: "text",
      },
      {
        name: "catcode",
        type: "text",
      },
      {
        name: "catdesc",
        type: "text",
      },
      {
        name: "baredesc",
        type: "text",
      },
    ],
    pg_get_object_address: [
      {
        name: "classid",
        type: "oid",
      },
      {
        name: "objid",
        type: "oid",
      },
      {
        name: "objsubid",
        type: "integer",
      },
    ],
    pg_logical_slot_get_changes: [
      {
        name: "lsn",
        type: "pg_lsn",
      },
      {
        name: "xid",
        type: "xid",
      },
      {
        name: "data",
        type: "text",
      },
    ],
    pg_logical_slot_peek_changes: [
      {
        name: "lsn",
        type: "pg_lsn",
      },
      {
        name: "xid",
        type: "xid",
      },
      {
        name: "data",
        type: "text",
      },
    ],
    pg_ls_archive_statusdir: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "size",
        type: "bigint",
      },
      {
        name: "modification",
        type: "timestamp",
      },
    ],
    pg_ls_dir: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    pg_ls_logdir: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "size",
        type: "bigint",
      },
      {
        name: "modification",
        type: "timestamp",
      },
    ],
    pg_ls_tmpdir: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "size",
        type: "bigint",
      },
      {
        name: "modification",
        type: "timestamp",
      },
    ],
    pg_ls_waldir: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "size",
        type: "bigint",
      },
      {
        name: "modification",
        type: "timestamp",
      },
    ],
    pg_options_to_table: [
      {
        name: "option_name",
        type: "text",
      },
      {
        name: "option_value",
        type: "text",
      },
    ],
    pg_read_binary_file: [
      {
        name: "$alias",
        type: "bytes",
      },
    ],
    pg_read_file: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    pg_stat_file: [
      {
        name: "size",
        type: "bigint",
      },
      {
        name: "access",
        type: "timestamp",
      },
      {
        name: "modification",
        type: "timestamp",
      },
      {
        name: "change",
        type: "timestamp",
      },
      {
        name: "creation",
        type: "timestamp",
      },
      {
        name: "isdir",
        type: "boolean",
      },
    ],
    pg_stat_get_activity: [
      {
        name: "datid",
        type: "oid",
      },
      {
        name: "pid",
        type: "integer",
      },
      {
        name: "usesysid",
        type: "oid",
      },
      {
        name: "application_name",
        type: "text",
      },
      {
        name: "state",
        type: "text",
      },
      {
        name: "query",
        type: "text",
      },
      {
        name: "query_start",
        type: "timestamp",
      },
      {
        name: "backend_start",
        type: "timestamp",
      },
      {
        name: "xact_start",
        type: "timestamp",
      },
      {
        name: "waiting",
        type: "boolean",
      },
    ],
    pg_stat_get_snapshot_timestamp: [
      {
        name: "$alias",
        type: "timestamp",
      },
    ],
    pg_timezone_abbrevs: [
      {
        name: "abbrev",
        type: "text",
      },
      {
        name: "utc_offset",
        type: "interval",
      },
      {
        name: "is_dst",
        type: "boolean",
      },
    ],
    pg_timezone_names: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "abbrev",
        type: "text",
      },
      {
        name: "utc_offset",
        type: "interval",
      },
      {
        name: "is_dst",
        type: "boolean",
      },
    ],
    regexp_matches: [
      {
        name: "$alias",
        type: "array<text>",
      },
    ],
    regexp_split_to_array: [
      {
        name: "$alias",
        type: "array<text>",
      },
    ],
    regexp_split_to_table: [
      {
        name: "$alias",
        type: "text",
      },
    ],
    ts_debug: [
      {
        name: "alias",
        type: "text",
      },
      {
        name: "description",
        type: "text",
      },
      {
        name: "token",
        type: "text",
      },
      {
        name: "dictionaries",
        type: "text[]",
      },
      {
        name: "dictionary",
        type: "text",
      },
      {
        name: "lexemes",
        type: "text[]",
      },
    ],
  },
  aggregate: {
    countType: "integer",
    avgDefault: "numeric",
    avgDecimal: "default",
    sumDecimal: "numeric",
  },
  commonTypes: {
    text: "varchar",
    decimalInteger: "decimal",
  },
  cast: {
    adjustment: "none",
  },
  arithmetic: {
    decimalInteger: "decimal",
  },
  windowFunctionTypes: {
    row_number: "integer",
    rank: "integer",
    dense_rank: "integer",
    ntile: "integer",
    n_tile: "integer",
    percent_rank: "decimal",
    cume_dist: "decimal",
  },
  specialParameterTypes: {},
  specialColumnTypes: {
    current_date: "date",
    current_time: "time",
    current_timestamp: "timestamp",
    localtimestamp: "timestamp",
  },
  qualifiedSpecialColumnTypes: {},
  pseudoColumnTypes: {},
  generatedNames: {
    countStar: "count",
    add: "postgresColumn",
    upper: "postgresFunction",
  },
  scriptPreprocessor: "psql",
  includeDirectives: [{ kind: "postgresql" }],
  complexTypeStyle: "angle",
  jdbcEscapeStyle: "standard",
  jdbcEscape: {
    ifnullFunction: "coalesce",
    temporalLiteral: "standard",
    executeCall: false,
    currentDateExpression: "current_date",
    currentTimeExpression: "current_time",
  },
  jdbcParameterMarker: "postgresOrdinal",
  parserFallbacks: {
    createView: "postgres",
    tableMacro: "duckdb",
    embeddedSqlTableFunction: "tsql",
  },
  parameterizedTypeFormats: {
    decimal: "numeric({args})",
    dec: "numeric({args})",
    numeric: "numeric({args})",
    number: "numeric({args})",
    timestamptz: "timestamp({args}) with time zone",
  },
  literalTypes: {
    string: "text",
  },
  dynamicTableFunctions: {
    generateSeriesColumn: "$alias",
    rangeColumn: "$alias",
    enabledHandlers: ["generateSeries"],
  },
  serializedSelect: {},
  outputTypeOverrides: {
    ifnull_text: "varchar(7)",
    isnull_text: "nchar(3)",
    min_date: "date",
    nvl_text: "varchar2(7)",
  },
  metadata: {
    builtinSchemaTables: [
      {
        schema: "information_schema",
        name: "tables",
        columns: [
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "name",
            type: "text",
          },
          {
            name: "table_type",
            type: "text",
          },
          {
            name: "self_referencing_column_name",
            type: "text",
          },
          {
            name: "reference_generation",
            type: "text",
          },
          {
            name: "user_defined_type_catalog",
            type: "text",
          },
          {
            name: "user_defined_type_schema",
            type: "text",
          },
          {
            name: "user_defined_type_name",
            type: "text",
          },
          {
            name: "is_insertable_into",
            type: "boolean",
          },
          {
            name: "is_typed",
            type: "boolean",
          },
          {
            name: "commit_action",
            type: "text",
          },
          {
            name: "created",
            type: "timestamp",
          },
          {
            name: "last_altered",
            type: "timestamp",
          },
          {
            name: "row_count",
            type: "integer",
          },
          {
            name: "bytes",
            type: "integer",
          },
          {
            name: "owner",
            type: "text",
          },
          {
            name: "retention_time",
            type: "text",
          },
          {
            name: "is_transient",
            type: "boolean",
          },
          {
            name: "is_temporary",
            type: "boolean",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "columns",
        columns: [
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "column_name",
            type: "text",
          },
          {
            name: "ordinal_position",
            type: "integer",
          },
          {
            name: "column_default",
            type: "text",
          },
          {
            name: "is_nullable",
            type: "boolean",
          },
          {
            name: "data_type",
            type: "text",
          },
          {
            name: "character_maximum_length",
            type: "integer",
          },
          {
            name: "character_octet_length",
            type: "integer",
          },
          {
            name: "numeric_precision",
            type: "integer",
          },
          {
            name: "numeric_precision_radix",
            type: "integer",
          },
          {
            name: "numeric_scale",
            type: "integer",
          },
          {
            name: "datetime_precision",
            type: "integer",
          },
          {
            name: "interval_type",
            type: "text",
          },
          {
            name: "interval_precision",
            type: "integer",
          },
          {
            name: "character_set_catalog",
            type: "text",
          },
          {
            name: "character_set_schema",
            type: "text",
          },
          {
            name: "character_set_name",
            type: "text",
          },
          {
            name: "collation_catalog",
            type: "text",
          },
          {
            name: "collation_schema",
            type: "text",
          },
          {
            name: "collation_name",
            type: "text",
          },
          {
            name: "domain_catalog",
            type: "text",
          },
          {
            name: "domain_schema",
            type: "text",
          },
          {
            name: "domain_name",
            type: "text",
          },
          {
            name: "udt_catalog",
            type: "text",
          },
          {
            name: "udt_schema",
            type: "text",
          },
          {
            name: "udt_name",
            type: "text",
          },
          {
            name: "scope_catalog",
            type: "text",
          },
          {
            name: "scope_schema",
            type: "text",
          },
          {
            name: "scope_name",
            type: "text",
          },
          {
            name: "maximum_cardinality",
            type: "integer",
          },
          {
            name: "dtd_identifier",
            type: "text",
          },
          {
            name: "is_self_referencing",
            type: "boolean",
          },
          {
            name: "is_identity",
            type: "boolean",
          },
          {
            name: "identity_generation",
            type: "text",
          },
          {
            name: "identity_start",
            type: "text",
          },
          {
            name: "identity_increment",
            type: "text",
          },
          {
            name: "identity_maximum",
            type: "text",
          },
          {
            name: "identity_minimum",
            type: "text",
          },
          {
            name: "identity_cycle",
            type: "boolean",
          },
          {
            name: "is_generated",
            type: "boolean",
          },
          {
            name: "generation_expression",
            type: "text",
          },
          {
            name: "is_updatable",
            type: "boolean",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "schemata",
        columns: [
          {
            name: "project_id",
            type: "text",
          },
          {
            name: "project_number",
            type: "text",
          },
          {
            name: "catalog_name",
            type: "text",
          },
          {
            name: "schema_name",
            type: "text",
          },
          {
            name: "schema_owner",
            type: "text",
          },
          {
            name: "default_character_set_catalog",
            type: "text",
          },
          {
            name: "default_character_set_schema",
            type: "text",
          },
          {
            name: "default_character_set_name",
            type: "text",
          },
          {
            name: "sql_path",
            type: "text",
          },
        ],
      },
      {
        name: "information_schema.routines",
        columns: [
          {
            name: "specific_catalog",
            type: "text",
          },
          {
            name: "specific_schema",
            type: "text",
          },
          {
            name: "specific_name",
            type: "text",
          },
          {
            name: "routine_catalog",
            type: "text",
          },
          {
            name: "routine_schema",
            type: "text",
          },
          {
            name: "routine_name",
            type: "text",
          },
          {
            name: "routine_type",
            type: "text",
          },
          {
            name: "data_type",
            type: "text",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "views",
        columns: [
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "view_definition",
            type: "text",
          },
          {
            name: "check_option",
            type: "boolean",
          },
          {
            name: "is_updatable",
            type: "boolean",
          },
          {
            name: "is_insertable_into",
            type: "boolean",
          },
          {
            name: "is_trigger_updatable",
            type: "boolean",
          },
          {
            name: "is_trigger_deletable",
            type: "boolean",
          },
          {
            name: "is_trigger_insertable_into",
            type: "boolean",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "functions",
        columns: [
          {
            name: "function_catalog",
            type: "text",
          },
          {
            name: "function_schema",
            type: "text",
          },
          {
            name: "function_name",
            type: "text",
          },
          {
            name: "function_owner",
            type: "text",
          },
          {
            name: "argument_signature",
            type: "text",
          },
          {
            name: "data_type",
            type: "text",
          },
          {
            name: "function_definition",
            type: "text",
          },
          {
            name: "created",
            type: "timestamp",
          },
          {
            name: "last_altered",
            type: "timestamp",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "table_constraints",
        columns: [
          {
            name: "constraint_catalog",
            type: "text",
          },
          {
            name: "constraint_schema",
            type: "text",
          },
          {
            name: "constraint_name",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "constraint_type",
            type: "text",
          },
          {
            name: "is_deferrable",
            type: "boolean",
          },
          {
            name: "initially_deferred",
            type: "boolean",
          },
          {
            name: "enforced",
            type: "boolean",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "key_column_usage",
        columns: [
          {
            name: "constraint_catalog",
            type: "text",
          },
          {
            name: "constraint_schema",
            type: "text",
          },
          {
            name: "constraint_name",
            type: "text",
          },
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "column_name",
            type: "text",
          },
          {
            name: "ordinal_position",
            type: "integer",
          },
          {
            name: "position_in_unique_constraint",
            type: "integer",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "referential_constraints",
        columns: [
          {
            name: "constraint_catalog",
            type: "text",
          },
          {
            name: "constraint_schema",
            type: "text",
          },
          {
            name: "constraint_name",
            type: "text",
          },
          {
            name: "unique_constraint_catalog",
            type: "text",
          },
          {
            name: "unique_constraint_schema",
            type: "text",
          },
          {
            name: "unique_constraint_name",
            type: "text",
          },
          {
            name: "match_option",
            type: "text",
          },
          {
            name: "update_rule",
            type: "text",
          },
          {
            name: "delete_rule",
            type: "text",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "triggers",
        columns: [
          {
            name: "trigger_catalog",
            type: "text",
          },
          {
            name: "trigger_schema",
            type: "text",
          },
          {
            name: "trigger_name",
            type: "text",
          },
          {
            name: "event_manipulation",
            type: "text",
          },
          {
            name: "event_object_catalog",
            type: "text",
          },
          {
            name: "event_object_schema",
            type: "text",
          },
          {
            name: "event_object_table",
            type: "text",
          },
          {
            name: "action_order",
            type: "integer",
          },
          {
            name: "action_condition",
            type: "text",
          },
          {
            name: "action_statement",
            type: "text",
          },
          {
            name: "action_orientation",
            type: "text",
          },
          {
            name: "action_timing",
            type: "text",
          },
          {
            name: "created",
            type: "timestamp",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "parameters",
        columns: [
          {
            name: "specific_catalog",
            type: "text",
          },
          {
            name: "specific_schema",
            type: "text",
          },
          {
            name: "specific_name",
            type: "text",
          },
          {
            name: "ordinal_position",
            type: "integer",
          },
          {
            name: "parameter_mode",
            type: "text",
          },
          {
            name: "is_result",
            type: "text",
          },
          {
            name: "as_locator",
            type: "text",
          },
          {
            name: "parameter_name",
            type: "text",
          },
          {
            name: "data_type",
            type: "text",
          },
          {
            name: "character_maximum_length",
            type: "integer",
          },
          {
            name: "numeric_precision",
            type: "integer",
          },
          {
            name: "numeric_scale",
            type: "integer",
          },
          {
            name: "routine_catalog",
            type: "text",
          },
          {
            name: "routine_schema",
            type: "text",
          },
          {
            name: "routine_name",
            type: "text",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "statistics",
        columns: [
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "non_unique",
            type: "boolean",
          },
          {
            name: "index_schema",
            type: "text",
          },
          {
            name: "index_name",
            type: "text",
          },
          {
            name: "seq_in_index",
            type: "integer",
          },
          {
            name: "column_name",
            type: "text",
          },
          {
            name: "collation",
            type: "text",
          },
          {
            name: "cardinality",
            type: "integer",
          },
          {
            name: "sub_part",
            type: "integer",
          },
          {
            name: "packed",
            type: "text",
          },
          {
            name: "nullable",
            type: "text",
          },
          {
            name: "index_type",
            type: "text",
          },
          {
            name: "comment",
            type: "text",
          },
          {
            name: "index_comment",
            type: "text",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "table_privileges",
        columns: [
          {
            name: "grantor",
            type: "text",
          },
          {
            name: "grantee",
            type: "text",
          },
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "privilege_type",
            type: "text",
          },
          {
            name: "is_grantable",
            type: "boolean",
          },
          {
            name: "with_hierarchy",
            type: "boolean",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "column_privileges",
        columns: [
          {
            name: "grantor",
            type: "text",
          },
          {
            name: "grantee",
            type: "text",
          },
          {
            name: "table_catalog",
            type: "text",
          },
          {
            name: "table_schema",
            type: "text",
          },
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "column_name",
            type: "text",
          },
          {
            name: "privilege_type",
            type: "text",
          },
          {
            name: "is_grantable",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_tables",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "tablename",
            type: "text",
          },
          {
            name: "tableowner",
            type: "text",
          },
          {
            name: "tablespace",
            type: "text",
          },
          {
            name: "hasindexes",
            type: "boolean",
          },
          {
            name: "hasrules",
            type: "boolean",
          },
          {
            name: "hastriggers",
            type: "boolean",
          },
          {
            name: "rowsecurity",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_roles",
        columns: [
          {
            name: "rolname",
            type: "text",
          },
          {
            name: "rolsuper",
            type: "boolean",
          },
          {
            name: "rolinherit",
            type: "boolean",
          },
          {
            name: "rolcreaterole",
            type: "boolean",
          },
          {
            name: "rolcreatedb",
            type: "boolean",
          },
          {
            name: "rolcanlogin",
            type: "boolean",
          },
          {
            name: "rolreplication",
            type: "boolean",
          },
          {
            name: "rolconnlimit",
            type: "integer",
          },
          {
            name: "rolpassword",
            type: "text",
          },
          {
            name: "rolvaliduntil",
            type: "timestamp",
          },
          {
            name: "rolconfig",
            type: "text",
          },
          {
            name: "oid",
            type: "integer",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_settings",
        columns: [
          {
            name: "name",
            type: "text",
          },
          {
            name: "setting",
            type: "text",
          },
          {
            name: "unit",
            type: "text",
          },
          {
            name: "category",
            type: "text",
          },
          {
            name: "short_desc",
            type: "text",
          },
          {
            name: "extra_desc",
            type: "text",
          },
          {
            name: "context",
            type: "text",
          },
          {
            name: "vartype",
            type: "text",
          },
          {
            name: "source",
            type: "text",
          },
          {
            name: "min_val",
            type: "text",
          },
          {
            name: "max_val",
            type: "text",
          },
          {
            name: "enumvals",
            type: "text",
          },
          {
            name: "boot_val",
            type: "text",
          },
          {
            name: "reset_val",
            type: "text",
          },
          {
            name: "pending_restart",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_stat_database",
        columns: [
          {
            name: "datid",
            type: "integer",
          },
          {
            name: "datname",
            type: "text",
          },
          {
            name: "numbackends",
            type: "integer",
          },
          {
            name: "xact_commit",
            type: "integer",
          },
          {
            name: "xact_rollback",
            type: "integer",
          },
          {
            name: "blks_read",
            type: "integer",
          },
          {
            name: "blks_hit",
            type: "integer",
          },
          {
            name: "tup_returned",
            type: "integer",
          },
          {
            name: "tup_fetched",
            type: "integer",
          },
          {
            name: "tup_inserted",
            type: "integer",
          },
          {
            name: "tup_updated",
            type: "integer",
          },
          {
            name: "tup_deleted",
            type: "integer",
          },
          {
            name: "stats_reset",
            type: "timestamp",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_user",
        columns: [
          {
            name: "usename",
            type: "text",
          },
          {
            name: "usesysid",
            type: "integer",
          },
          {
            name: "usecreatedb",
            type: "boolean",
          },
          {
            name: "usesuper",
            type: "boolean",
          },
          {
            name: "userepl",
            type: "boolean",
          },
          {
            name: "usebypassrls",
            type: "boolean",
          },
          {
            name: "valuntil",
            type: "timestamp",
          },
          {
            name: "useconfig",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_indexes",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "tablename",
            type: "text",
          },
          {
            name: "indexname",
            type: "text",
          },
          {
            name: "tablespace",
            type: "text",
          },
          {
            name: "indexdef",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_locks",
        columns: [
          {
            name: "locktype",
            type: "text",
          },
          {
            name: "database",
            type: "integer",
          },
          {
            name: "relation",
            type: "integer",
          },
          {
            name: "page",
            type: "integer",
          },
          {
            name: "tuple",
            type: "integer",
          },
          {
            name: "virtualxid",
            type: "text",
          },
          {
            name: "transactionid",
            type: "text",
          },
          {
            name: "classid",
            type: "integer",
          },
          {
            name: "objid",
            type: "integer",
          },
          {
            name: "objsubid",
            type: "integer",
          },
          {
            name: "virtualtransaction",
            type: "text",
          },
          {
            name: "pid",
            type: "integer",
          },
          {
            name: "mode",
            type: "text",
          },
          {
            name: "granted",
            type: "boolean",
          },
          {
            name: "fastpath",
            type: "boolean",
          },
          {
            name: "waitstart",
            type: "timestamp",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_class",
        columns: [
          {
            name: "relname",
            type: "text",
          },
          {
            name: "relnamespace",
            type: "integer",
          },
          {
            name: "relkind",
            type: "text",
          },
          {
            name: "relowner",
            type: "integer",
          },
          {
            name: "relam",
            type: "integer",
          },
          {
            name: "relfilenode",
            type: "integer",
          },
          {
            name: "reltablespace",
            type: "integer",
          },
          {
            name: "relpages",
            type: "integer",
          },
          {
            name: "reltuples",
            type: "integer",
          },
          {
            name: "relhasindex",
            type: "boolean",
          },
          {
            name: "relisshared",
            type: "boolean",
          },
          {
            name: "relpersistence",
            type: "text",
          },
          {
            name: "relrowsecurity",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_class",
        columns: [
          {
            name: "relname",
            type: "text",
          },
          {
            name: "relnamespace",
            type: "integer",
          },
          {
            name: "relkind",
            type: "text",
          },
          {
            name: "relowner",
            type: "integer",
          },
          {
            name: "relam",
            type: "integer",
          },
          {
            name: "relfilenode",
            type: "integer",
          },
          {
            name: "reltablespace",
            type: "integer",
          },
          {
            name: "relpages",
            type: "integer",
          },
          {
            name: "reltuples",
            type: "integer",
          },
          {
            name: "relhasindex",
            type: "boolean",
          },
          {
            name: "relisshared",
            type: "boolean",
          },
          {
            name: "relpersistence",
            type: "text",
          },
          {
            name: "relrowsecurity",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_namespace",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "nspname",
            type: "text",
          },
          {
            name: "nspowner",
            type: "integer",
          },
          {
            name: "nspacl",
            type: "text",
          },
        ],
      },
      {
        name: "pg_namespace",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "nspname",
            type: "text",
          },
          {
            name: "nspowner",
            type: "integer",
          },
          {
            name: "nspacl",
            type: "text",
          },
        ],
      },
      {
        name: "pg_available_extensions",
        columns: [
          {
            name: "name",
            type: "text",
          },
          {
            name: "default_version",
            type: "text",
          },
          {
            name: "installed_version",
            type: "text",
          },
          {
            name: "comment",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_extension",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "extname",
            type: "text",
          },
          {
            name: "extowner",
            type: "integer",
          },
          {
            name: "extnamespace",
            type: "integer",
          },
          {
            name: "extrelocatable",
            type: "boolean",
          },
          {
            name: "extversion",
            type: "text",
          },
          {
            name: "extconfig",
            type: "text",
          },
          {
            name: "extcondition",
            type: "text",
          },
        ],
      },
      {
        name: "pg_extension",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "extname",
            type: "text",
          },
          {
            name: "extowner",
            type: "integer",
          },
          {
            name: "extnamespace",
            type: "integer",
          },
          {
            name: "extrelocatable",
            type: "boolean",
          },
          {
            name: "extversion",
            type: "text",
          },
          {
            name: "extconfig",
            type: "text",
          },
          {
            name: "extcondition",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_type",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "typname",
            type: "text",
          },
          {
            name: "typnamespace",
            type: "integer",
          },
          {
            name: "typowner",
            type: "integer",
          },
          {
            name: "typlen",
            type: "integer",
          },
          {
            name: "typbyval",
            type: "boolean",
          },
          {
            name: "typtype",
            type: "text",
          },
          {
            name: "typcategory",
            type: "text",
          },
          {
            name: "typispreferred",
            type: "boolean",
          },
          {
            name: "typnotnull",
            type: "boolean",
          },
          {
            name: "typbasetype",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_type",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "typname",
            type: "text",
          },
          {
            name: "typnamespace",
            type: "integer",
          },
          {
            name: "typowner",
            type: "integer",
          },
          {
            name: "typlen",
            type: "integer",
          },
          {
            name: "typbyval",
            type: "boolean",
          },
          {
            name: "typtype",
            type: "text",
          },
          {
            name: "typcategory",
            type: "text",
          },
          {
            name: "typispreferred",
            type: "boolean",
          },
          {
            name: "typnotnull",
            type: "boolean",
          },
          {
            name: "typbasetype",
            type: "integer",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_proc",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "proname",
            type: "text",
          },
          {
            name: "pronamespace",
            type: "integer",
          },
          {
            name: "proowner",
            type: "integer",
          },
          {
            name: "prolang",
            type: "text",
          },
          {
            name: "procost",
            type: "decimal",
          },
          {
            name: "prorows",
            type: "decimal",
          },
          {
            name: "provariadic",
            type: "text",
          },
          {
            name: "prokind",
            type: "text",
          },
          {
            name: "prosecdef",
            type: "boolean",
          },
          {
            name: "proleakproof",
            type: "boolean",
          },
          {
            name: "proisstrict",
            type: "boolean",
          },
          {
            name: "proretset",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_proc",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "proname",
            type: "text",
          },
          {
            name: "pronamespace",
            type: "integer",
          },
          {
            name: "proowner",
            type: "integer",
          },
          {
            name: "prolang",
            type: "text",
          },
          {
            name: "procost",
            type: "decimal",
          },
          {
            name: "prorows",
            type: "decimal",
          },
          {
            name: "provariadic",
            type: "text",
          },
          {
            name: "prokind",
            type: "text",
          },
          {
            name: "prosecdef",
            type: "boolean",
          },
          {
            name: "proleakproof",
            type: "boolean",
          },
          {
            name: "proisstrict",
            type: "boolean",
          },
          {
            name: "proretset",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_constraint",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "conname",
            type: "text",
          },
          {
            name: "connamespace",
            type: "integer",
          },
          {
            name: "contype",
            type: "text",
          },
          {
            name: "condeferrable",
            type: "boolean",
          },
          {
            name: "condeferred",
            type: "boolean",
          },
          {
            name: "convalidated",
            type: "boolean",
          },
          {
            name: "conrelid",
            type: "integer",
          },
          {
            name: "confrelid",
            type: "integer",
          },
          {
            name: "conkey",
            type: "text",
          },
        ],
      },
      {
        name: "pg_constraint",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "conname",
            type: "text",
          },
          {
            name: "connamespace",
            type: "integer",
          },
          {
            name: "contype",
            type: "text",
          },
          {
            name: "condeferrable",
            type: "boolean",
          },
          {
            name: "condeferred",
            type: "boolean",
          },
          {
            name: "convalidated",
            type: "boolean",
          },
          {
            name: "conrelid",
            type: "integer",
          },
          {
            name: "confrelid",
            type: "integer",
          },
          {
            name: "conkey",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_attribute",
        columns: [
          {
            name: "attrelid",
            type: "integer",
          },
          {
            name: "attname",
            type: "text",
          },
          {
            name: "atttypid",
            type: "integer",
          },
          {
            name: "attlen",
            type: "integer",
          },
          {
            name: "attnum",
            type: "integer",
          },
          {
            name: "attndims",
            type: "integer",
          },
          {
            name: "attnotnull",
            type: "boolean",
          },
          {
            name: "atthasdef",
            type: "boolean",
          },
          {
            name: "attisdropped",
            type: "boolean",
          },
          {
            name: "attislocal",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_attribute",
        columns: [
          {
            name: "attrelid",
            type: "integer",
          },
          {
            name: "attname",
            type: "text",
          },
          {
            name: "atttypid",
            type: "integer",
          },
          {
            name: "attlen",
            type: "integer",
          },
          {
            name: "attnum",
            type: "integer",
          },
          {
            name: "attndims",
            type: "integer",
          },
          {
            name: "attnotnull",
            type: "boolean",
          },
          {
            name: "atthasdef",
            type: "boolean",
          },
          {
            name: "attisdropped",
            type: "boolean",
          },
          {
            name: "attislocal",
            type: "boolean",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_stat_user_indexes",
        columns: [
          {
            name: "relid",
            type: "integer",
          },
          {
            name: "indexrelid",
            type: "integer",
          },
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "relname",
            type: "text",
          },
          {
            name: "indexrelname",
            type: "text",
          },
          {
            name: "idx_scan",
            type: "integer",
          },
          {
            name: "idx_tup_read",
            type: "integer",
          },
          {
            name: "idx_tup_fetch",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_stat_user_indexes",
        columns: [
          {
            name: "relid",
            type: "integer",
          },
          {
            name: "indexrelid",
            type: "integer",
          },
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "relname",
            type: "text",
          },
          {
            name: "indexrelname",
            type: "text",
          },
          {
            name: "idx_scan",
            type: "integer",
          },
          {
            name: "idx_tup_read",
            type: "integer",
          },
          {
            name: "idx_tup_fetch",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_settings",
        columns: [
          {
            name: "name",
            type: "text",
          },
          {
            name: "setting",
            type: "text",
          },
          {
            name: "unit",
            type: "text",
          },
          {
            name: "category",
            type: "text",
          },
          {
            name: "short_desc",
            type: "text",
          },
          {
            name: "extra_desc",
            type: "text",
          },
          {
            name: "context",
            type: "text",
          },
          {
            name: "vartype",
            type: "text",
          },
          {
            name: "source",
            type: "text",
          },
          {
            name: "pending_restart",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_stat_activity",
        columns: [
          {
            name: "datid",
            type: "integer",
          },
          {
            name: "datname",
            type: "text",
          },
          {
            name: "pid",
            type: "integer",
          },
          {
            name: "leader_pid",
            type: "integer",
          },
          {
            name: "usesysid",
            type: "integer",
          },
          {
            name: "usename",
            type: "text",
          },
          {
            name: "application_name",
            type: "text",
          },
          {
            name: "client_addr",
            type: "text",
          },
          {
            name: "state",
            type: "text",
          },
          {
            name: "query",
            type: "text",
          },
          {
            name: "query_start",
            type: "timestamp",
          },
        ],
      },
      {
        name: "pg_stat_user_tables",
        columns: [
          {
            name: "relid",
            type: "integer",
          },
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "relname",
            type: "text",
          },
          {
            name: "seq_scan",
            type: "integer",
          },
          {
            name: "seq_tup_read",
            type: "integer",
          },
          {
            name: "idx_scan",
            type: "integer",
          },
          {
            name: "idx_tup_fetch",
            type: "integer",
          },
          {
            name: "n_tup_ins",
            type: "integer",
          },
          {
            name: "n_tup_upd",
            type: "integer",
          },
          {
            name: "n_tup_del",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_stat_database",
        columns: [
          {
            name: "datid",
            type: "integer",
          },
          {
            name: "datname",
            type: "text",
          },
          {
            name: "numbackends",
            type: "integer",
          },
          {
            name: "xact_commit",
            type: "integer",
          },
          {
            name: "xact_rollback",
            type: "integer",
          },
          {
            name: "blks_read",
            type: "integer",
          },
          {
            name: "blks_hit",
            type: "integer",
          },
          {
            name: "tup_returned",
            type: "integer",
          },
          {
            name: "tup_fetched",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_roles",
        columns: [
          {
            name: "rolname",
            type: "text",
          },
          {
            name: "rolsuper",
            type: "boolean",
          },
          {
            name: "rolinherit",
            type: "boolean",
          },
          {
            name: "rolcreaterole",
            type: "boolean",
          },
          {
            name: "rolcreatedb",
            type: "boolean",
          },
          {
            name: "rolcanlogin",
            type: "boolean",
          },
          {
            name: "rolconnlimit",
            type: "integer",
          },
        ],
      },
      {
        name: "pg_user",
        columns: [
          {
            name: "usename",
            type: "text",
          },
          {
            name: "usesysid",
            type: "integer",
          },
          {
            name: "usecreatedb",
            type: "boolean",
          },
          {
            name: "usesuper",
            type: "boolean",
          },
          {
            name: "userepl",
            type: "boolean",
          },
          {
            name: "usebypassrls",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_database",
        columns: [
          {
            name: "oid",
            type: "integer",
          },
          {
            name: "datname",
            type: "text",
          },
          {
            name: "datdba",
            type: "integer",
          },
          {
            name: "encoding",
            type: "text",
          },
          {
            name: "datcollate",
            type: "text",
          },
          {
            name: "datctype",
            type: "text",
          },
          {
            name: "datistemplate",
            type: "boolean",
          },
          {
            name: "datallowconn",
            type: "boolean",
          },
        ],
      },
      {
        name: "pg_indexes",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "tablename",
            type: "text",
          },
          {
            name: "indexname",
            type: "text",
          },
          {
            name: "tablespace",
            type: "text",
          },
          {
            name: "indexdef",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_views",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "viewname",
            type: "text",
          },
          {
            name: "viewowner",
            type: "text",
          },
          {
            name: "definition",
            type: "text",
          },
        ],
      },
      {
        schema: "pg_catalog",
        name: "pg_matviews",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "matviewname",
            type: "text",
          },
          {
            name: "matviewowner",
            type: "text",
          },
          {
            name: "tablespace",
            type: "text",
          },
          {
            name: "ispopulated",
            type: "boolean",
          },
          {
            name: "definition",
            type: "text",
          },
        ],
      },
      {
        name: "pg_views",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "viewname",
            type: "text",
          },
          {
            name: "viewowner",
            type: "text",
          },
          {
            name: "definition",
            type: "text",
          },
        ],
      },
      {
        name: "pg_matviews",
        columns: [
          {
            name: "schemaname",
            type: "text",
          },
          {
            name: "matviewname",
            type: "text",
          },
          {
            name: "matviewowner",
            type: "text",
          },
          {
            name: "tablespace",
            type: "text",
          },
          {
            name: "ispopulated",
            type: "boolean",
          },
          {
            name: "definition",
            type: "text",
          },
        ],
      },
    ],
    describeFunctionColumns: [
      { name: "Name", type: "text" },
      { name: "Description", type: "text" },
    ],
    explainColumns: [{ name: "QUERY PLAN", type: "text" }],
    snowflakeDescribeObjectColumns: {},
    showTableListingColumns: [
      { name: "created_on", type: "timestamp" },
      { name: "name", type: "text" },
      { name: "database_name", type: "text" },
      { name: "schema_name", type: "text" },
      { name: "kind", type: "text" },
      { name: "comment", type: "text" },
      { name: "cluster_by", type: "text" },
      { name: "rows", type: "integer" },
      { name: "bytes", type: "integer" },
      { name: "owner", type: "text" },
      { name: "retention_time", type: "integer" },
      { name: "automatic_clustering", type: "text" },
      { name: "change_tracking", type: "boolean" },
      { name: "search_optimization", type: "boolean" },
    ],
    commandResultColumns: [
      {
        pattern: "/^(?:list|ls)\\s+@/",
        columns: [
          { name: "name", type: "text" },
          { name: "size", type: "integer" },
          { name: "md5", type: "text" },
          { name: "last_modified", type: "timestamp" },
        ],
      },
      {
        pattern: "/^get\\s+@/",
        columns: [
          { name: "file", type: "text" },
          { name: "size", type: "integer" },
          { name: "status", type: "text" },
          { name: "message", type: "text" },
        ],
      },
      {
        pattern: "/^(?:remove|rm)\\s+@/",
        columns: [
          { name: "name", type: "text" },
          { name: "result", type: "text" },
        ],
      },
      {
        pattern: "/^list\\s+(?:file|jar|archive)\\b/",
        columns: [{ name: "resource", type: "text" }],
      },
    ],
  },
  diagnosticRules: {
    knownTableFunctionArgumentNames: ["file", "url"],
    virtualTableArgumentNames: ["highlight", "snippet", "bm25", "fts5vocab"],
  },
} satisfies DialectConfig;
