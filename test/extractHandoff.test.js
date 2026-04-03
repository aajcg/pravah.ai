import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";

import { extractHandoff, EMPTY_HANDOFF } from "../src/extractHandoff.js";

const ORIGINAL_AXIOS_POST = axios.post;
const ORIGINAL_API_KEY = process.env.OPENROUTER_API_KEY;

function cloneEmptyHandoff() {
  return {
    blockers: [],
    tasks: [],
    owners: [],
    deadlines: [],
    decisions: [],
    dependencies: [],
  };
}

test.afterEach(() => {
  axios.post = ORIGINAL_AXIOS_POST;
  process.env.OPENROUTER_API_KEY = ORIGINAL_API_KEY;
});

test("returns EMPTY_HANDOFF shape when messages are empty", async () => {
  const result = await extractHandoff([]);
  assert.deepEqual(result, cloneEmptyHandoff());
});

test("uses local extraction fallback when OPENROUTER_API_KEY is missing", async () => {
  delete process.env.OPENROUTER_API_KEY;

  const result = await extractHandoff(["Payment API failing"]);
  assert.deepEqual(result, {
    blockers: ["Payment API failing"],
    tasks: [],
    owners: [],
    deadlines: [],
    decisions: [],
    dependencies: [],
  });
});

test("parses valid JSON payload from mocked OpenRouter response", async () => {
  process.env.OPENROUTER_API_KEY = "test-key";

  axios.post = async () => ({
    data: {
      choices: [
        {
          message: {
            content: JSON.stringify({
              blockers: ["Payment API timeout"],
              tasks: ["Implement retry logic"],
              owners: ["Rahul -> retry logic"],
              deadlines: ["Fix by tonight"],
              decisions: ["Do not rollback yet"],
              dependencies: ["Fix timeout issue before deployment"],
            }),
          },
        },
      ],
    },
  });

  const result = await extractHandoff(["mock conversation"]);

  assert.deepEqual(result, {
    blockers: ["Payment API timeout"],
    tasks: ["Implement retry logic"],
    owners: ["Rahul -> retry logic"],
    deadlines: ["Fix by tonight"],
    decisions: ["Do not rollback yet"],
    dependencies: ["Fix timeout issue before deployment"],
  });
});

test("returns fallback when model output is not valid JSON", async () => {
  process.env.OPENROUTER_API_KEY = "test-key";

  axios.post = async () => ({
    data: {
      choices: [
        {
          message: {
            content: "this is not json",
          },
        },
      ],
    },
  });

  const result = await extractHandoff(["mock conversation"]);
  assert.deepEqual(result, cloneEmptyHandoff());
});

test("returns fallback when OpenRouter request fails", async () => {
  process.env.OPENROUTER_API_KEY = "test-key";

  axios.post = async () => {
    throw new Error("network error");
  };

  const result = await extractHandoff(["mock conversation"]);
  assert.deepEqual(result, cloneEmptyHandoff());
});

test("EMPTY_HANDOFF constant remains immutable", () => {
  assert.deepEqual(EMPTY_HANDOFF, cloneEmptyHandoff());
  assert.equal(Object.isFrozen(EMPTY_HANDOFF), true);
});
