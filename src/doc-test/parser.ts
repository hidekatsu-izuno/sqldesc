import { readFile } from "node:fs/promises";
import type {
  DocTestCase,
  ExpectedColumn,
  GivenSpec,
  ParsedTestDoc,
  PrepareBlock,
  ThenKind,
  ThenSpec,
  WhenSpec,
} from "./types.js";

const SKIP_SECTION_TITLES = new Set([
  "目次",
  "診断コード一覧（付録）",
  "CLI JSON 出力スキーマ（付録）",
  "既知の限界",
]);

const PROSE_PREPARE_NONE = /^スキーマ(不要|なし)/;
const PROSE_PREPARE_BASE = /^共通ベーススキーマ/;

export async function parseTestDocFile(filePath: string): Promise<ParsedTestDoc> {
  const markdown = await readFile(filePath, "utf8");
  return parseTestDoc(markdown);
}

export function parseTestDoc(markdown: string): ParsedTestDoc {
  const defaultDialect = extractDocDialect(markdown) ?? "sqlite";
  const prepares = new Map<string, PrepareBlock>();
  const cases: DocTestCase[] = [];

  for (const section of splitLevel2Sections(markdown)) {
    const prepare = parsePrepareSection(section);
    if (prepare) {
      prepares.set(prepare.id, prepare);
      continue;
    }

    if (SKIP_SECTION_TITLES.has(section.title)) continue;
    if (!section.body.includes("### When")) continue;

    const testCase = parseTestCaseSection(section, defaultDialect);
    if (testCase) cases.push(testCase);
  }

  return { defaultDialect, prepares, cases };
}

function extractDocDialect(markdown: string): string | undefined {
  const match = markdown.match(/```yaml\s+doc:\s*sqldesc-test\/v\d+\s+dialect:\s*(\S+)/);
  return match?.[1];
}

function splitLevel2Sections(
  markdown: string,
): Array<{ heading: string; title: string; body: string }> {
  const parts = markdown.split(/\n(?=## )/);
  return parts.slice(1).map((part) => {
    const [headingLine, ...bodyLines] = part.split("\n");
    const heading = headingLine.replace(/^## /, "").trim();
    const title = heading
      .replace(/^Prepare-\d+:\s*/, "")
      .replace(/^TC-[\w-]+:\s*/, "")
      .trim();
    return { heading, title, body: bodyLines.join("\n") };
  });
}

function parsePrepareSection(section: {
  heading: string;
  title: string;
  body: string;
}): PrepareBlock | undefined {
  const match = section.heading.match(/^Prepare-(\d+):\s*(.+)$/);
  if (!match) return undefined;

  const meta = parseYamlFence(section.body);
  const sql = extractFence(section.body, "sql");
  if (!sql) return undefined;

  return {
    id: `Prepare-${match[1]}`,
    title: match[2].trim(),
    kind: "schema-ddl",
    dialect: typeof meta.dialect === "string" ? meta.dialect : undefined,
    content: sql,
  };
}

function parseTestCaseSection(
  section: { heading: string; title: string; body: string },
  defaultDialect: string,
): DocTestCase | null {
  const explicitId = section.heading.match(/^TC-([\w-]+):/)?.[1];
  const id = explicitId ? `TC-${explicitId}` : slugify(section.title || section.heading || "case");

  const givenBody = extractSubsection(section.body, "Given");
  const whenBody = extractSubsection(section.body, "When");
  const thenBody = extractSubsection(section.body, "Then");
  if (!whenBody || !thenBody) return null;

  return {
    id,
    title: section.title || section.heading,
    given: parseGiven(givenBody ?? "", defaultDialect),
    when: parseWhen(whenBody, defaultDialect),
    then: parseThen(thenBody),
  };
}

function parseGiven(body: string, defaultDialect: string): GivenSpec {
  const meta = parseYamlFence(body);
  const given: GivenSpec = {};

  if (typeof meta.prepare === "string") {
    given.prepare =
      meta.prepare === "none"
        ? undefined
        : meta.prepare
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
  } else if (typeof meta.dialect === "string") {
    given.dialect = meta.dialect;
  }
  if (typeof meta.binds === "string") given.binds = meta.binds;
  if (typeof meta.dialect === "string") given.dialect = meta.dialect;

  const sql = extractFence(body, "sql");
  const json = extractFence(body, "json");
  if (json) {
    try {
      given.schemaJson = JSON.parse(json) as Record<string, unknown>;
    } catch {
      given.schemaJson = undefined;
    }
  } else if (sql) {
    given.schemaDdl = sql;
  }

  const prose = body
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .join("\n")
    .trim();

  if (!meta.prepare && !sql && !json && prose) {
    if (PROSE_PREPARE_NONE.test(prose)) {
      // no schema
    } else if (PROSE_PREPARE_BASE.test(prose)) {
      given.prepare = ["Prepare-1"];
    } else if (/スキーマメタデータ/.test(prose) && json) {
      // handled above
    } else if (
      /スキーマファイル/.test(prose) ||
      /loadSchema/.test(prose) ||
      /describeQuery/.test(prose)
    ) {
      // file-based scenarios are not auto-executed
      given.prepare = undefined;
    }
  }

  if (meta.prepare === "none") {
    given.prepare = undefined;
  }

  const bindsMatch = prose.match(/バインド型:\s*`([^`]+)`/);
  if (bindsMatch) given.binds = bindsMatch[1];

  const dialectMatch = prose.match(/方言:\s*`([^`]+)`/);
  if (dialectMatch) given.dialect = dialectMatch[1];
  if (!given.dialect) given.dialect = defaultDialect;

  return given;
}

function parseWhen(body: string, defaultDialect: string): WhenSpec {
  const meta = parseYamlFence(body);
  const sql = extractFence(body, "sql");
  const sh = extractFence(body, "sh");
  const js = extractFence(body, "javascript") ?? extractFence(body, "js");

  if (js && !sql) {
    return { kind: "js", dialect: defaultDialect };
  }
  if (sh && !sql) {
    return {
      kind: "cli",
      dialect: typeof meta.dialect === "string" ? meta.dialect : defaultDialect,
    };
  }

  const when: WhenSpec = {
    kind: sql ? "sql" : "none",
    sql,
    dialect: typeof meta.dialect === "string" ? meta.dialect : defaultDialect,
    binds: typeof meta.binds === "string" ? meta.binds : undefined,
  };

  const prose = body.replace(/```[\s\S]*?```/g, "").trim();
  const bindsMatch = prose.match(/バインド型:\s*`([^`]+)`/);
  if (bindsMatch) when.binds = bindsMatch[1];
  const dialectMatch = prose.match(/方言:\s*`([^`]+)`/);
  if (dialectMatch) when.dialect = dialectMatch[1];

  return when;
}

function parseThen(body: string): ThenSpec {
  const meta = parseYamlFence(body);
  const prose = body.replace(/```[\s\S]*?```/g, "").trim();

  const verify = meta.verify === true;

  if (meta.kind === "skip" || meta.automated === false) {
    return {
      kind: "skip",
      target: "first",
      verify,
      skipReason: typeof meta.reason === "string" ? meta.reason : "marked skip",
    };
  }

  const target: "first" | "last" =
    /最後の文/.test(prose) || meta.target === "last" ? "last" : "first";
  const columns = parseColumnTable(body);
  const bullets = prose
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));

  if (meta.kind === "error" || bullets.some((line) => /`Error`/.test(line))) {
    const errorLine = bullets.find((line) => /`Error`/.test(line) || /Parse error/.test(line));
    return {
      kind: "error",
      target,
      verify,
      errorMatch:
        typeof meta.match === "string"
          ? meta.match
          : (errorLine?.match(/`([^`]+)`/)?.[1] ?? "Parse error"),
    };
  }

  if (
    meta.kind === "none" ||
    bullets.some(
      (line) => /`columns`:\s*空/.test(line) || /結果なし/.test(line) || /結果列なし/.test(line),
    )
  ) {
    const diagnostics =
      typeof meta.diagnostics === "string"
        ? [meta.diagnostics]
        : bullets
            .map((line) => line.match(/`([A-Z][A-Z0-9_]+)`/)?.[1])
            .filter((code): code is string => Boolean(code));
    const resultKindMatch = bullets.find((line) => /resultKind/.test(line));
    return {
      kind: "none",
      target,
      verify,
      diagnostics,
      resultKind:
        typeof meta.resultKind === "string"
          ? meta.resultKind
          : resultKindMatch?.includes("none")
            ? "none"
            : undefined,
    };
  }

  if (columns.length > 0) {
    return { kind: "columns", target, verify, columns };
  }

  if (bullets.length > 0 && !columns.length) {
    return { kind: "skip", target, verify, skipReason: "freeform bullets" };
  }

  return { kind: "skip", target, verify, skipReason: "no executable expectation" };
}

function parseColumnTable(body: string): ExpectedColumn[] {
  const lines = body.split("\n");
  const columns: ExpectedColumn[] = [];
  let inTable = false;

  for (const line of lines) {
    if (/^\|\s*name\s*\|\s*type\s*\|\s*source\s*\|/.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/^\|\s*-{2,}/.test(line)) continue;
    if (!line.startsWith("|")) break;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 2) continue;

    const [name, type, sourceRaw] = cells;
    if (!type || (name === "name" && type === "type")) continue;

    columns.push({
      name,
      type,
      source: normalizeSource(sourceRaw),
    });
  }

  return columns;
}

function normalizeSource(source?: string): string | undefined {
  if (!source || source === "—" || source === "-" || source === "–") return undefined;
  return source;
}

function extractSubsection(body: string, name: "Given" | "When" | "Then"): string | undefined {
  const pattern = new RegExp(`### ${name}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n---\\s*\\n|$)`);
  return body.match(pattern)?.[1]?.trim();
}

function extractFence(body: string, lang: string): string | undefined {
  const pattern = new RegExp("```" + lang + "\\s*\\n([\\s\\S]*?)\\n```", "i");
  return body.match(pattern)?.[1]?.trim();
}

function parseYamlFence(body: string): Record<string, string | boolean> {
  const yaml = extractFence(body, "yaml");
  if (!yaml) return {};

  const result: Record<string, string | boolean> = {};
  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([\w-]+):\s*(.+)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (rawValue === "true") result[key] = true;
    else if (rawValue === "false") result[key] = false;
    else result[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
  return result;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[`'"]/g, "")
      .replace(/[^\w\u3000-\u9fff]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "case"
  );
}
