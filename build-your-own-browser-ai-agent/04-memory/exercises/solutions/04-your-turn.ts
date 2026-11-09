// Solution 04 · Run with: MODEL=fake npx tsx exercises/solutions/04-your-turn.ts
import { chromium } from "playwright";
import { tool, HumanMessage, SystemMessage, ToolMessage, AIMessage, type BaseMessage, type StructuredTool } from "langchain";
import { StateGraph, StateSchema, MessagesValue, ReducedValue, START, END, GraphRecursionError } from "@langchain/langgraph";
import { z } from "zod";
import { chatModel } from "../../model.ts";
import { browserTools } from "../../03-tools.ts";

const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
const note = tool(async () => "Saved.",
  { name: "note", description: "Write a short note to remember for later.", schema: z.object({ text: z.string() }) });
const tools: StructuredTool[] = [...browserTools(await browser.newPage()), note];
const model = chatModel("04").bindTools(tools);

const State = new StateSchema({
  messages: MessagesValue,
  notes: new ReducedValue(z.array(z.string()).default(() => []), { reducer: (a, b: string[]) => a.concat(b) }),
  tokens: new ReducedValue(z.number().default(0), { reducer: (a, b: number) => a + b }),
});

const isSnapshot = (m: BaseMessage) => ToolMessage.isInstance(m) && m.name === "snapshot";
function forgetOldSnapshots(messages: BaseMessage[]) {
  const newest = messages.findLastIndex(isSnapshot);
  return messages.map((m, i) => isSnapshot(m) && i !== newest
    ? new ToolMessage({ content: "[old snapshot removed]", tool_call_id: (m as ToolMessage).tool_call_id, name: "snapshot" })
    : m);
}

const agent: typeof State.Node = async (state) => {
  const context = [
    new SystemMessage(`You drive a web browser. Your notes:\n${state.notes.join("\n") || "(none yet)"}`),
    ...forgetOldSnapshots(state.messages),
  ];
  const reply = await model.invoke(context);
  const u = reply.usage_metadata;
  const chars = (ms: BaseMessage[]) => ms.reduce((n, m) => n + m.text.length, 0);
  console.log(`agent: context ${chars(context)} chars (${chars([context[0], ...state.messages])} without forgetting),`,
    `tokens in ${u?.input_tokens} out ${u?.output_tokens}`);
  return { messages: [reply], tokens: u?.total_tokens ?? 0 };
};

const act: typeof State.Node = async (state) => {
  const messages: ToolMessage[] = [], notes: string[] = [];
  for (const call of (state.messages.at(-1) as AIMessage).tool_calls ?? []) {
    const result = await tools.find((t) => t.name === call.name)!.invoke(call);
    console.log(`  ${call.name}(${JSON.stringify(call.args)}) -> ${result.text.replace(/\s+/g, " ").slice(0, 60)}`);
    messages.push(result);
    if (call.name === "note") notes.push(call.args.text);
  }
  return { messages, notes };
};

const app = new StateGraph(State)
  .addNode("agent", agent).addNode("tools", act)
  .addEdge(START, "agent").addEdge("tools", "agent")
  .addConditionalEdges("agent", (s) => ((s.messages.at(-1) as AIMessage).tool_calls?.length ? "tools" : END), ["tools", END])
  .compile();

const task = "On https://demo.playwright.dev/todomvc/ add 'Buy milk', 'Walk the dog' and 'Call mum', note what you added, mark 'Call mum' done.";
const end = await app.invoke({ messages: [new HumanMessage(task)] }, { recursionLimit: 30 })
  .catch((e) => { if (e instanceof GraphRecursionError) return null; throw e; });
console.log(end ? `Agent: ${end.messages.at(-1)!.text}\nNotes: ${end.notes.join(" | ")}\nTokens used: ${end.tokens}`
  : "Stopped: the step limit was reached.");
await browser.close();
