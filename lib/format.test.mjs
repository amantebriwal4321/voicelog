import test from "node:test";
import assert from "node:assert";
import { toEntry, clean } from "./format.mjs";
test("drops fillers", () => assert.equal(clean("um so I uh fixed the the bug"), "so I fixed the bug"));
test("buckets", () => {
  const e = toEntry("Yesterday I fixed the login bug. Today I'm going to write tests. I'm blocked on the API key #auth");
  assert.equal(e.parts.yesterday.length, 1);
  assert.equal(e.parts.today.length, 1);
  assert.equal(e.parts.blockers.length, 1);
  assert.deepEqual(e.tags, ["auth"]);
});
