// Solution 02 · Run with: npx tsx --test exercises/solutions/02-your-turn.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { AIMessage, HumanMessage, type BaseMessage } from "langchain";
import { END } from "@langchain/langgraph";

const next = (state: { messages: BaseMessage[] }) =>
  (state.messages.at(-1) as AIMessage).tool_calls?.length ? "tools" : END;

test("when the last message has a tool call, next picks tools", () => {
  const state = {
    messages: [
      new HumanMessage("Open https://demo.playwright.dev/todomvc/"),
      new AIMessage({ content: "", tool_calls: [{ name: "navigate", args: { url: "https://demo.playwright.dev/todomvc/" }, id: "call_1", type: "tool_call" }] }),
    ],
  };
  assert.equal(next(state), "tools");
});

test("when the last message has no tool call, next stops at END", () => {
  const state = {
    messages: [new HumanMessage("Hello"), new AIMessage("Done.")],
  };
  assert.equal(next(state), END);
});
