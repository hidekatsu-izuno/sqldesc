import type { DialectConfig } from "../types.js";

export const dialectConfig = {
  name: "trino",
  aliases: [],
  family: "trino",
  typeFamily: "trino",
  displayTypes: {
    bigint: "bigint",
    blob: "varbinary",
    boolean: "boolean",
    bytes: "varbinary",
    clob: "varchar",
    date: "date",
    datetime: "timestamp(3)",
    decimal: "decimal",
    double: "double",
    integer: "integer",
    json: "json",
    jsonb: "json",
    nclob: "varchar",
    text: "varchar",
    time: "time",
    timestamp: "timestamp(3)",
    timestamptz: "timestamp(3) with time zone",
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
  tableFunctions: {},
  aggregate: {
    countType: "bigint",
    avgDefault: "decimal",
    avgDecimal: "default",
    sumDecimal: "decimal38",
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
    row_number: "bigint",
    rank: "bigint",
    dense_rank: "bigint",
    ntile: "bigint",
    n_tile: "bigint",
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
  complexTypeStyle: "trino",
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
    string: "varcharLength",
  },
  dynamicTableFunctions: {
    generateSeriesColumn: "$alias",
    rangeColumn: "$alias",
    enabledHandlers: ["sequence"],
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
        name: "applicable_roles",
        columns: [
          {
            name: "grantee",
            type: "varchar",
          },
          {
            name: "grantee_type",
            type: "varchar",
          },
          {
            name: "role_name",
            type: "varchar",
          },
          {
            name: "is_grantable",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "columns",
        columns: [
          {
            name: "table_catalog",
            type: "varchar",
          },
          {
            name: "table_schema",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "column_name",
            type: "varchar",
          },
          {
            name: "ordinal_position",
            type: "bigint",
          },
          {
            name: "column_default",
            type: "varchar",
          },
          {
            name: "is_nullable",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "enabled_roles",
        columns: [
          {
            name: "role_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "roles",
        columns: [
          {
            name: "role_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "schemata",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "schema_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "table_privileges",
        columns: [
          {
            name: "grantor",
            type: "varchar",
          },
          {
            name: "grantor_type",
            type: "varchar",
          },
          {
            name: "grantee",
            type: "varchar",
          },
          {
            name: "grantee_type",
            type: "varchar",
          },
          {
            name: "table_catalog",
            type: "varchar",
          },
          {
            name: "table_schema",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "privilege_type",
            type: "varchar",
          },
          {
            name: "is_grantable",
            type: "varchar",
          },
          {
            name: "with_hierarchy",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "tables",
        columns: [
          {
            name: "table_catalog",
            type: "varchar",
          },
          {
            name: "table_schema",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "table_type",
            type: "varchar",
          },
        ],
      },
      {
        schema: "information_schema",
        name: "views",
        columns: [
          {
            name: "table_catalog",
            type: "varchar",
          },
          {
            name: "table_schema",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "view_definition",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "attributes",
        columns: [
          {
            name: "type_cat",
            type: "varchar",
          },
          {
            name: "type_schem",
            type: "varchar",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "attr_name",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "bigint",
          },
          {
            name: "attr_type_name",
            type: "varchar",
          },
          {
            name: "attr_size",
            type: "bigint",
          },
          {
            name: "decimal_digits",
            type: "bigint",
          },
          {
            name: "num_prec_radix",
            type: "bigint",
          },
          {
            name: "nullable",
            type: "bigint",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "attr_def",
            type: "varchar",
          },
          {
            name: "sql_data_type",
            type: "bigint",
          },
          {
            name: "sql_datetime_sub",
            type: "bigint",
          },
          {
            name: "char_octet_length",
            type: "bigint",
          },
          {
            name: "ordinal_position",
            type: "bigint",
          },
          {
            name: "is_nullable",
            type: "varchar",
          },
          {
            name: "scope_catalog",
            type: "varchar",
          },
          {
            name: "scope_schema",
            type: "varchar",
          },
          {
            name: "scope_table",
            type: "varchar",
          },
          {
            name: "source_data_type",
            type: "bigint",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "catalogs",
        columns: [
          {
            name: "table_cat",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "columns",
        columns: [
          {
            name: "table_cat",
            type: "varchar",
          },
          {
            name: "table_schem",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "column_name",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "bigint",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "column_size",
            type: "bigint",
          },
          {
            name: "buffer_length",
            type: "bigint",
          },
          {
            name: "decimal_digits",
            type: "bigint",
          },
          {
            name: "num_prec_radix",
            type: "bigint",
          },
          {
            name: "nullable",
            type: "bigint",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "column_def",
            type: "varchar",
          },
          {
            name: "sql_data_type",
            type: "bigint",
          },
          {
            name: "sql_datetime_sub",
            type: "bigint",
          },
          {
            name: "char_octet_length",
            type: "bigint",
          },
          {
            name: "ordinal_position",
            type: "bigint",
          },
          {
            name: "is_nullable",
            type: "varchar",
          },
          {
            name: "scope_catalog",
            type: "varchar",
          },
          {
            name: "scope_schema",
            type: "varchar",
          },
          {
            name: "scope_table",
            type: "varchar",
          },
          {
            name: "source_data_type",
            type: "bigint",
          },
          {
            name: "is_autoincrement",
            type: "varchar",
          },
          {
            name: "is_generatedcolumn",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "procedure_columns",
        columns: [
          {
            name: "procedure_cat",
            type: "varchar",
          },
          {
            name: "procedure_schem",
            type: "varchar",
          },
          {
            name: "procedure_name",
            type: "varchar",
          },
          {
            name: "column_name",
            type: "varchar",
          },
          {
            name: "column_type",
            type: "bigint",
          },
          {
            name: "data_type",
            type: "bigint",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "precision",
            type: "bigint",
          },
          {
            name: "length",
            type: "bigint",
          },
          {
            name: "scale",
            type: "bigint",
          },
          {
            name: "radix",
            type: "bigint",
          },
          {
            name: "nullable",
            type: "bigint",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "column_def",
            type: "varchar",
          },
          {
            name: "sql_data_type",
            type: "bigint",
          },
          {
            name: "sql_datetime_sub",
            type: "bigint",
          },
          {
            name: "char_octet_length",
            type: "bigint",
          },
          {
            name: "ordinal_position",
            type: "bigint",
          },
          {
            name: "is_nullable",
            type: "varchar",
          },
          {
            name: "specific_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "procedures",
        columns: [
          {
            name: "procedure_cat",
            type: "varchar",
          },
          {
            name: "procedure_schem",
            type: "varchar",
          },
          {
            name: "procedure_name",
            type: "varchar",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "procedure_type",
            type: "bigint",
          },
          {
            name: "specific_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "pseudo_columns",
        columns: [
          {
            name: "table_cat",
            type: "varchar",
          },
          {
            name: "table_schem",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "column_name",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "bigint",
          },
          {
            name: "column_size",
            type: "bigint",
          },
          {
            name: "decimal_digits",
            type: "bigint",
          },
          {
            name: "num_prec_radix",
            type: "bigint",
          },
          {
            name: "column_usage",
            type: "varchar",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "char_octet_length",
            type: "bigint",
          },
          {
            name: "is_nullable",
            type: "bigint",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "schemas",
        columns: [
          {
            name: "table_schem",
            type: "varchar",
          },
          {
            name: "table_catalog",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "super_tables",
        columns: [
          {
            name: "table_cat",
            type: "varchar",
          },
          {
            name: "table_schem",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "supertable_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "super_types",
        columns: [
          {
            name: "type_cat",
            type: "varchar",
          },
          {
            name: "type_schem",
            type: "varchar",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "supertype_cat",
            type: "varchar",
          },
          {
            name: "supertype_schem",
            type: "varchar",
          },
          {
            name: "supertype_name",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "table_types",
        columns: [
          {
            name: "table_type",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "tables",
        columns: [
          {
            name: "table_cat",
            type: "varchar",
          },
          {
            name: "table_schem",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "table_type",
            type: "varchar",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "type_cat",
            type: "varchar",
          },
          {
            name: "type_schem",
            type: "varchar",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "self_referencing_col_name",
            type: "varchar",
          },
          {
            name: "ref_generation",
            type: "varchar",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "types",
        columns: [
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "bigint",
          },
          {
            name: "precision",
            type: "bigint",
          },
          {
            name: "literal_prefix",
            type: "varchar",
          },
          {
            name: "literal_suffix",
            type: "varchar",
          },
          {
            name: "create_params",
            type: "varchar",
          },
          {
            name: "nullable",
            type: "bigint",
          },
          {
            name: "case_sensitive",
            type: "boolean",
          },
          {
            name: "searchable",
            type: "bigint",
          },
          {
            name: "unsigned_attribute",
            type: "boolean",
          },
          {
            name: "fixed_prec_scale",
            type: "boolean",
          },
          {
            name: "auto_increment",
            type: "boolean",
          },
          {
            name: "local_type_name",
            type: "varchar",
          },
          {
            name: "minimum_scale",
            type: "bigint",
          },
          {
            name: "maximum_scale",
            type: "bigint",
          },
          {
            name: "sql_data_type",
            type: "bigint",
          },
          {
            name: "sql_datetime_sub",
            type: "bigint",
          },
          {
            name: "num_prec_radix",
            type: "bigint",
          },
        ],
      },
      {
        schema: "jdbc",
        name: "udts",
        columns: [
          {
            name: "type_cat",
            type: "varchar",
          },
          {
            name: "type_schem",
            type: "varchar",
          },
          {
            name: "type_name",
            type: "varchar",
          },
          {
            name: "class_name",
            type: "varchar",
          },
          {
            name: "data_type",
            type: "varchar",
          },
          {
            name: "remarks",
            type: "varchar",
          },
          {
            name: "base_type",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "analyze_properties",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "property_name",
            type: "varchar",
          },
          {
            name: "default_value",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "catalogs",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "connector_id",
            type: "varchar",
          },
          {
            name: "connector_name",
            type: "varchar",
          },
          {
            name: "state",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "column_properties",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "property_name",
            type: "varchar",
          },
          {
            name: "default_value",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "functions_authorization",
        columns: [
          {
            name: "catalog",
            type: "varchar",
          },
          {
            name: "schema",
            type: "varchar",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "authorization_type",
            type: "varchar",
          },
          {
            name: "authorization",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "materialized_view_properties",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "property_name",
            type: "varchar",
          },
          {
            name: "default_value",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "materialized_views",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "schema_name",
            type: "varchar",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "storage_catalog",
            type: "varchar",
          },
          {
            name: "storage_schema",
            type: "varchar",
          },
          {
            name: "storage_table",
            type: "varchar",
          },
          {
            name: "freshness",
            type: "varchar",
          },
          {
            name: "last_fresh_time",
            type: "timestamp with time zone",
          },
          {
            name: "comment",
            type: "varchar",
          },
          {
            name: "definition",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "schema_properties",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "property_name",
            type: "varchar",
          },
          {
            name: "default_value",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "schemas_authorization",
        columns: [
          {
            name: "catalog",
            type: "varchar",
          },
          {
            name: "schema",
            type: "varchar",
          },
          {
            name: "authorization_type",
            type: "varchar",
          },
          {
            name: "authorization",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "table_comments",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "schema_name",
            type: "varchar",
          },
          {
            name: "table_name",
            type: "varchar",
          },
          {
            name: "comment",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "table_properties",
        columns: [
          {
            name: "catalog_name",
            type: "varchar",
          },
          {
            name: "property_name",
            type: "varchar",
          },
          {
            name: "default_value",
            type: "varchar",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
        ],
      },
      {
        schema: "metadata",
        name: "tables_authorization",
        columns: [
          {
            name: "catalog",
            type: "varchar",
          },
          {
            name: "schema",
            type: "varchar",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "authorization_type",
            type: "varchar",
          },
          {
            name: "authorization",
            type: "varchar",
          },
        ],
      },
      {
        schema: "runtime",
        name: "nodes",
        columns: [
          {
            name: "node_id",
            type: "varchar",
          },
          {
            name: "http_uri",
            type: "varchar",
          },
          {
            name: "node_version",
            type: "varchar",
          },
          {
            name: "coordinator",
            type: "boolean",
          },
          {
            name: "state",
            type: "varchar",
          },
        ],
      },
      {
        schema: "runtime",
        name: "optimizer_rule_stats",
        columns: [
          {
            name: "rule_name",
            type: "varchar",
          },
          {
            name: "invocations",
            type: "bigint",
          },
          {
            name: "matches",
            type: "bigint",
          },
          {
            name: "failures",
            type: "bigint",
          },
          {
            name: "average_time",
            type: "double",
          },
          {
            name: "time_distribution_percentiles",
            type: "map(double, double)",
          },
        ],
      },
      {
        schema: "runtime",
        name: "queries",
        columns: [
          {
            name: "query_id",
            type: "varchar",
          },
          {
            name: "state",
            type: "varchar",
          },
          {
            name: "user",
            type: "varchar",
          },
          {
            name: "source",
            type: "varchar",
          },
          {
            name: "query",
            type: "varchar",
          },
          {
            name: "resource_group_id",
            type: "array(varchar)",
          },
          {
            name: "queued_time_ms",
            type: "bigint",
          },
          {
            name: "analysis_time_ms",
            type: "bigint",
          },
          {
            name: "planning_time_ms",
            type: "bigint",
          },
          {
            name: "created",
            type: "timestamp with time zone",
          },
          {
            name: "started",
            type: "timestamp with time zone",
          },
          {
            name: "last_heartbeat",
            type: "timestamp with time zone",
          },
          {
            name: "end",
            type: "timestamp with time zone",
          },
          {
            name: "error_type",
            type: "varchar",
          },
          {
            name: "error_code",
            type: "varchar",
          },
        ],
      },
      {
        schema: "runtime",
        name: "tasks",
        columns: [
          {
            name: "node_id",
            type: "varchar",
          },
          {
            name: "task_id",
            type: "varchar",
          },
          {
            name: "stage_id",
            type: "varchar",
          },
          {
            name: "query_id",
            type: "varchar",
          },
          {
            name: "state",
            type: "varchar",
          },
          {
            name: "splits",
            type: "bigint",
          },
          {
            name: "queued_splits",
            type: "bigint",
          },
          {
            name: "running_splits",
            type: "bigint",
          },
          {
            name: "completed_splits",
            type: "bigint",
          },
          {
            name: "split_scheduled_time_ms",
            type: "bigint",
          },
          {
            name: "split_cpu_time_ms",
            type: "bigint",
          },
          {
            name: "split_blocked_time_ms",
            type: "bigint",
          },
          {
            name: "internal_network_input_bytes",
            type: "bigint",
          },
          {
            name: "processed_input_bytes",
            type: "bigint",
          },
          {
            name: "processed_input_rows",
            type: "bigint",
          },
          {
            name: "output_bytes",
            type: "bigint",
          },
          {
            name: "output_rows",
            type: "bigint",
          },
          {
            name: "physical_input_bytes",
            type: "bigint",
          },
          {
            name: "physical_written_bytes",
            type: "bigint",
          },
          {
            name: "created",
            type: "timestamp with time zone",
          },
          {
            name: "start",
            type: "timestamp with time zone",
          },
          {
            name: "last_heartbeat",
            type: "timestamp with time zone",
          },
          {
            name: "end",
            type: "timestamp with time zone",
          },
        ],
      },
      {
        schema: "runtime",
        name: "transactions",
        columns: [
          {
            name: "transaction_id",
            type: "varchar",
          },
          {
            name: "isolation_level",
            type: "varchar",
          },
          {
            name: "read_only",
            type: "boolean",
          },
          {
            name: "auto_commit_context",
            type: "boolean",
          },
          {
            name: "create_time",
            type: "timestamp with time zone",
          },
          {
            name: "idle_time_secs",
            type: "bigint",
          },
          {
            name: "written_catalog",
            type: "varchar",
          },
          {
            name: "catalogs",
            type: "array(varchar)",
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
