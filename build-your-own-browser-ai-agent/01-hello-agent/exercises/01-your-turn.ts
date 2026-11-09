// Your turn 01 · The same loop. Fill in line 30, the stop line, then run: npm run ex01
import { chromium } from "playwright";
import { tool, HumanMessage, type BaseMessage } from "langchain";
import { z } from "zod";
import { chatModel } from "../model.ts";
// 1. A real browser the agent can drive
const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
const page = await browser.newPage();

// 2. One tool: the agent's only "hand"
const navigate = tool(
  async ({ url }) => {
    await page.goto(url);
    return `Opened ${url}. The page title is "${await page.title()}".`;
  },
  { name: "navigate", description: "Open a URL in the browser.", schema: z.object({ url: z.string() }) },
);

// 3. The model, told which tools it may call
const model = chatModel("ex01").bindTools([navigate]);

// 4. The loop. No magic: think, act, look at the result, think again.
const messages: BaseMessage[] = [
  new HumanMessage("Go to https://demo.playwright.dev/todomvc/ and tell me the page title."),
];
for (let step = 1; step <= 5; step++) {
  console.log(`model call ${step}`);
  const reply = await model.invoke(messages); // think
  messages.push(reply);
  // ___ your turn: stop the loop when the reply has no tool calls

  for (const call of reply.tool_calls) {
    console.log(`step ${step}: ${call.name}(${JSON.stringify(call.args)})`);
    const result = await navigate.invoke(call); // act: run the tool
    console.log(`  -> ${result.text}`);
    messages.push(result); // a ToolMessage: the result + the id of the call it answers
  }
}

console.log("Agent:", messages.at(-1)!.text);
await browser.close();
