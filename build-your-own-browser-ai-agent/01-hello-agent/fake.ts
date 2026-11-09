// MODEL=fake: a scripted stand-in for Gemini, for runs without an API key.
// Only the model is simulated. Every tool call it makes runs in a real browser,
// and it reads refs and results from the real snapshots it gets back.
import { AIMessage, ToolMessage, fakeModel, countTokensApproximately, type BaseMessage } from "langchain";

type Turn = (messages: BaseMessage[]) => AIMessage;
const TODO = "https://demo.playwright.dev/todomvc/";
let ids = 0;

const call = (name: string, args: (ms: BaseMessage[]) => Record<string, unknown>): Turn => (ms) =>
  new AIMessage({ content: "", tool_calls: [{ name, args: args(ms), id: `call_${++ids}`, type: "tool_call" }] });
const fixed = (name: string, args: Record<string, unknown>) => call(name, () => args);

// What the fake "sees": the newest snapshot that is still in its context.
const snap = (ms: BaseMessage[]) =>
  String([...ms].reverse().find((m) => ToolMessage.isInstance(m) && String(m.content).includes("[ref="))?.content ?? "");
const ref = (ms: BaseMessage[], re: RegExp) => snap(ms).match(re)?.[1] ?? "e0";
const BOX = /textbox "What needs to be done\?"[^\n]*\[ref=(e\d+)\]/;
const toggle = (todo: string) => new RegExp(`checkbox "Toggle Todo" \\[ref=(e\\d+)\\]\\n\\s*- generic \\[ref=e\\d+\\]: ${todo}`);
export const itemsLeft = (ms: BaseMessage[]) => snap(ms).match(/: "(\d+)"\n\s*- text: items? left/)?.[1] ?? "?";

// Adds an estimated usage_metadata (chars / 4), so token counting has numbers to show.
const withUsage = (turn: Turn): Turn => (ms) => {
  const m = turn(ms);
  const input_tokens = countTokensApproximately(ms);
  const output_tokens = Math.ceil((m.text.length + JSON.stringify(m.tool_calls ?? []).length) / 4);
  m.usage_metadata = { input_tokens, output_tokens, total_tokens: input_tokens + output_tokens };
  return m;
};

const add = (text: string) => call("type", (ms) => ({ ref: ref(ms, BOX), text, submit: true }));
const scripts: Record<string, Turn[]> = {
  "01": [fixed("navigate", { url: TODO }), (ms) => new AIMessage(`Done. ${ms.at(-1)?.text}`)],
  "03": [
    fixed("navigate", { url: TODO }), fixed("snapshot", {}),
    add("Buy milk"),
    fixed("type", { role: "textbox", name: "What needs to be done?", text: "Walk the dog", submit: true }),
    fixed("snapshot", {}),
    call("click", (ms) => ({ ref: ref(ms, toggle("Buy milk")) })),
    fixed("click", { role: "button", name: "Delete everything" }), // no such button: the error comes back as text
    fixed("snapshot", {}),
    (ms) => new AIMessage(`Done. There is no "Delete everything" button, so I skipped it. The page says ${itemsLeft(ms)} item left.`),
  ],
  "04": [
    fixed("navigate", { url: TODO }), fixed("snapshot", {}),
    add("Buy milk"), fixed("snapshot", {}),
    add("Walk the dog"), fixed("snapshot", {}),
    add("Call mum"), fixed("snapshot", {}),
    fixed("note", { text: "Added 3 todos: Buy milk, Walk the dog, Call mum." }),
    call("click", (ms) => ({ ref: ref(ms, toggle("Call mum")) })), fixed("snapshot", {}),
    (ms) => new AIMessage(`All done. ${itemsLeft(ms)} items left.`),
  ],
  "05": [
    fixed("navigate", { url: TODO }), fixed("snapshot", {}),
    add("Buy milk"), add("Walk the dog"), fixed("snapshot", {}),
    call("click", (ms) => ({ ref: ref(ms, toggle("Buy milk")) })), fixed("snapshot", {}),
    call("Verdict", (ms) => {
      const left = itemsLeft(ms);
      const want = String(ms[1]?.content).match(/says (\d+) items? left/)?.[1];
      return { passed: left === want, reason: `The footer says ${left} item${left === "1" ? "" : "s"} left; expected ${want}.` };
    }),
  ],
};
scripts["02"] = scripts["01"];
// Your turn 01 (exercises/01-your-turn.ts): the same two replies, then the fake keeps answering "Done",
// so a loop with no stop line runs into its step limit instead of the fake running out of replies.
const done: Turn = (ms) => new AIMessage(`Done. ${[...ms].reverse().find((m) => ToolMessage.isInstance(m))?.text}`);
scripts["ex01"] = [fixed("navigate", { url: TODO }), done, done, done, done, done];

export function fakeFor(lesson: string) {
  const model = fakeModel();
  for (const turn of scripts[lesson]) model.respond(withUsage(turn));
  return model;
}
