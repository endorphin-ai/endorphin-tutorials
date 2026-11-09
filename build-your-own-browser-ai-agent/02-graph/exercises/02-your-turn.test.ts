// Your turn 02 · A unit test for next() (lines 29–30 of 02-graph.ts). Fill in line 16, then run: npm run your-turn
import assert from "node:assert/strict";
import { test } from "node:test";
import { AIMessage, HumanMessage, type BaseMessage } from "langchain";
import { END } from "@langchain/langgraph";

// The routing function from 02-graph.ts:
const next = (state: { messages: BaseMessage[] }) =>
  (state.messages.at(-1) as AIMessage).tool_calls?.length ? "tools" : END;

test("when the last message has a tool call, next picks tools", () => {
  const state = {
    messages: [
      new HumanMessage("Open https://demo.playwright.dev/todomvc/"),
      new AIMessage({ content: "", tool_calls: [{ name: "navigate", args: { url: "https://demo.playwright.dev/todomvc/" }, id: "call_1", type: "tool_call" }] }),
    ],
  };
  assert.equal(next(state), "___"); // ___ your turn: which box runs next?
});

test("when the last message has no tool call, next stops at END", () => {
  const state = {
    messages: [new HumanMessage("Hello"), new AIMessage("Done.")],
  };
  assert.equal(next(state), END);
});
