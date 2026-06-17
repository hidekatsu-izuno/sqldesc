import type { DialectConfig } from "../types.js";

export const dialectConfig = {
  name: "snowflake",
  aliases: [],
  family: "snowflake",
  typeFamily: "snowflake",
  displayTypes: {
    bigint: "BIGINT",
    blob: "BLOB",
    boolean: "BOOLEAN",
    bytes: "VARBINARY(255)",
    clob: "CLOB",
    date: "DATE",
    datetime: "TIMESTAMP",
    decimal: "DECIMAL",
    double: "DECIMAL",
    integer: "INTEGER",
    json: "VARCHAR(4000)",
    jsonb: "VARCHAR(4000)",
    nclob: "NCLOB",
    text: "VARCHAR(255)",
    time: "TIME",
    timestamp: "TIMESTAMP",
    timestamptz: "TIMESTAMP_WITH_TIMEZONE",
    uuid: "VARCHAR(36)",
    xml: "SQLXML",
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
    JAVA_OBJECT: "variant",
    LONGNVARCHAR: "text",
    LONGVARBINARY: "bytes",
    LONGVARCHAR: "text",
    NCHAR: "text",
    NCLOB: "text",
    NULL: "unknown",
    NUMERIC: "decimal",
    NVARCHAR: "text",
    OTHER: "variant",
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
    normal: "decimal",
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
    randstr: "text",
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
    seq1: "integer",
    seq2: "integer",
    seq4: "integer",
    seq8: "integer",
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
    uniform: "decimal",
    unhex: "bytes",
    upper: "text",
    user: "text",
    uuid: "uuid",
    uuid_string: "uuid",
    version: "text",
    week: "integer",
    xxhash64: "integer",
    year: "integer",
    zipf: "decimal",
  },
  scalarFunctionTypePatterns: {},
  tableFunctions: {
    flatten: [
      {
        name: "seq",
        type: "integer",
      },
      {
        name: "key",
        type: "text",
      },
      {
        name: "path",
        type: "text",
      },
      {
        name: "index",
        type: "integer",
      },
      {
        name: "value",
        type: "variant",
      },
      {
        name: "this",
        type: "variant",
      },
    ],
    generator: [],
    getnextval: [
      {
        name: "nextval",
        type: "integer",
      },
    ],
    infer_schema: [
      {
        name: "expression",
        type: "text",
      },
      {
        name: "column_name",
        type: "text",
      },
      {
        name: "type",
        type: "text",
      },
      {
        name: "nullable",
        type: "boolean",
      },
      {
        name: "filenames",
        type: "array<text>",
      },
      {
        name: "order_id",
        type: "integer",
      },
    ],
    split_to_table: [
      {
        name: "seq",
        type: "integer",
      },
      {
        name: "index",
        type: "integer",
      },
      {
        name: "value",
        type: "text",
      },
    ],
  },
  aggregate: {
    countType: "integer",
    avgDefault: "decimal",
    avgDecimal: "default",
    sumDecimal: "input",
  },
  commonTypes: {
    text: "none",
    decimalInteger: "none",
  },
  cast: {
    adjustment: "none",
  },
  arithmetic: {
    decimalInteger: "none",
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
    countStar: "count(*)",
    add: "compact",
    upper: "call",
  },
  scriptPreprocessor: "none",
  includeDirectives: [],
  complexTypeStyle: "angle",
  jdbcEscapeStyle: "standard",
  jdbcEscape: {
    ifnullFunction: "coalesce",
    temporalLiteral: "standard",
    executeCall: false,
    currentDateExpression: "current_date",
    currentTimeExpression: "current_time",
  },
  jdbcParameterMarker: "question",
  parserFallbacks: {
    createView: "postgres",
    tableMacro: "duckdb",
    embeddedSqlTableFunction: "tsql",
  },
  parameterizedTypeFormats: {
    decimal: "decimal({args})",
    dec: "decimal({args})",
    numeric: "decimal({args})",
    number: "decimal({args})",
  },
  literalTypes: {
    string: "text",
  },
  dynamicTableFunctions: {
    generateSeriesColumn: "$alias",
    rangeColumn: "$alias",
    enabledHandlers: [],
  },
  selectStar: {},
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
        schema: "information_schema",
        name: "query_history",
        columns: [
          {
            name: "query_id",
            type: "text",
          },
          {
            name: "query_text",
            type: "text",
          },
          {
            name: "database_name",
            type: "text",
          },
          {
            name: "schema_name",
            type: "text",
          },
          {
            name: "query_type",
            type: "text",
          },
          {
            name: "session_id",
            type: "text",
          },
          {
            name: "user_name",
            type: "text",
          },
          {
            name: "role_name",
            type: "text",
          },
          {
            name: "warehouse_name",
            type: "text",
          },
          {
            name: "start_time",
            type: "timestamp",
          },
          {
            name: "end_time",
            type: "timestamp",
          },
          {
            name: "total_elapsed_time",
            type: "integer",
          },
          {
            name: "rows_produced",
            type: "integer",
          },
          {
            name: "bytes_scanned",
            type: "integer",
          },
          {
            name: "bytes_written",
            type: "integer",
          },
          {
            name: "execution_status",
            type: "text",
          },
          {
            name: "error_code",
            type: "text",
          },
          {
            name: "error_message",
            type: "text",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "warehouses",
        columns: [
          {
            name: "warehouse_name",
            type: "text",
          },
          {
            name: "warehouse_type",
            type: "text",
          },
          {
            name: "warehouse_size",
            type: "text",
          },
          {
            name: "state",
            type: "text",
          },
          {
            name: "cluster_count",
            type: "integer",
          },
          {
            name: "max_cluster_count",
            type: "integer",
          },
          {
            name: "min_cluster_count",
            type: "integer",
          },
          {
            name: "auto_suspend",
            type: "integer",
          },
          {
            name: "auto_resume",
            type: "boolean",
          },
          {
            name: "resource_monitor",
            type: "text",
          },
          {
            name: "comment",
            type: "text",
          },
        ],
      },
      {
        schema: "account_usage",
        name: "query_history",
        columns: [
          {
            name: "query_id",
            type: "text",
          },
          {
            name: "execution_status",
            type: "text",
          },
          {
            name: "query_text",
            type: "text",
          },
        ],
      },
      {
        schema: "account_usage",
        name: "users",
        columns: [
          {
            name: "name",
            type: "text",
          },
          {
            name: "login_name",
            type: "text",
          },
          {
            name: "disabled",
            type: "boolean",
          },
        ],
      },
      {
        schema: "account_usage",
        name: "tables",
        columns: [
          {
            name: "table_name",
            type: "text",
          },
          {
            name: "row_count",
            type: "integer",
          },
          {
            name: "table_schema",
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
    snowflakeDescribeObjectColumns: {
      alert: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      warehouse: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
        { name: "default", type: "text" },
        { name: "level", type: "text" },
        { name: "description", type: "text" },
      ],
      integration: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      stage: [
        { name: "parent_property", type: "text" },
        { name: "property", type: "text" },
        { name: "property_type", type: "text" },
        { name: "property_value", type: "text" },
        { name: "property_default", type: "text" },
      ],
      pipe: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      stream: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      task: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      role: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      user: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      database: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
      share: [
        { name: "property", type: "text" },
        { name: "value", type: "text" },
      ],
    },
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
    showTablesColumns: [
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
  },
  diagnosticRules: {
    knownTableFunctionArgumentNames: ["file", "url"],
    virtualTableArgumentNames: ["highlight", "snippet", "bm25", "fts5vocab"],
  },
} satisfies DialectConfig;
