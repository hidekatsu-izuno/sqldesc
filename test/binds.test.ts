import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseBinds } from "../dist/binds.js";

describe("parseBinds", () => {
  it("parses positional bind types", () => {
    assert.deepStrictEqual(parseBinds("int,text"), ["int", "text"]);
  });

  it("parses named bind types", () => {
    assert.deepStrictEqual(parseBinds("id=int,name=text"), {
      id: "int",
      name: "text",
    });
  });

  it("returns undefined for empty input", () => {
    assert.strictEqual(parseBinds(), undefined);
    assert.strictEqual(parseBinds(""), undefined);
  });

  it("rejects mixed positional and named syntax", () => {
    assert.throws(() => parseBinds("id=int,text"), /Mixed bind syntax/);
  });
});
