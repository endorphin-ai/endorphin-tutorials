// 02 · The same loop, drawn as a graph: START → agent → tools → agent → … → END
import { chromium } from "playwright";
import { tool, HumanMessage, AIMessage } from "langchain";
import { StateGraph, StateSchema, MessagesValue, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { chatModel } from "./model.ts";

const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
const page = await browser.newPage();

const navigate = tool(
  async ({ url }) => {
    await page.goto(url);
    return `Opened ${url}. The page title is "${await page.title()}".`;
  },
  { name: "navigate", description: "Open a URL in the browser.", schema: z.object({ url: z.string() }) },
);
const tools = [navigate];
const model = chatModel("02").bindTools(tools);

// The state: what the graph remembers between steps. Here, only the chat.
const State = new StateSchema({ messages: MessagesValue });

// Node "agent": ask the model
const agent: typeof State.Node = async (state) => ({ messages: [await model.invoke(state.messages)] });

// Edge: did the model ask for a tool? Then go to "tools", else stop.
const next = (state: typeof State.State) =>
  (state.messages.at(-1) as AIMessage).tool_calls?.length ? "tools" : END;

const app = new StateGraph(State)
  .addNode("agent", agent)
  .addNode("tools", new ToolNode(tools)) // runs the tool calls, adds ToolMessages
  .addEdge(START, "agent")
  .addConditionalEdges("agent", next, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

const result = await app.invoke(
  { messages: [new HumanMessage("Go to https://demo.playwright.dev/todomvc/ and tell me the page title.")] },
  { recursionLimit: 10 }, // the brake: at most 10 graph steps
);

for (const m of result.messages) console.log(`${m.type}:`, m.text || JSON.stringify((m as AIMessage).tool_calls));
await browser.close();
