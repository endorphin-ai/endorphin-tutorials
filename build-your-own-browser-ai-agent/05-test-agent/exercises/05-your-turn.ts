// Your turn 05 · Fill in line 14: a wrong number must print FAILED; 1 must print PASSED. Run: npm run your-turn
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createAgent, modelCallLimitMiddleware, type AIMessage } from "langchain";
import { z } from "zod";
import { chatModel } from "../model.ts";
import { browserTools } from "../03-tools.ts";

const tests = [
  { name: "Complete a todo", expected: "The footer says 1 item left.",
    steps: "Open https://demo.playwright.dev/todomvc/. Add 'Buy milk' and 'Walk the dog'. Mark 'Buy milk' as done." },
  { name: "Wrong on purpose", expected: "The footer says 2 items left.", // this one should fail
    steps: "Open https://demo.playwright.dev/todomvc/. Add 'Buy milk' and 'Walk the dog'. Mark 'Buy milk' as done." },
  { name: "Your turn", expected: "The footer says ____ items left.", // ___ your turn: 3 -> FAILED, 1 -> PASSED
    steps: "Open https://demo.playwright.dev/todomvc/. Add 'Buy milk' and 'Walk the dog'. Mark 'Buy milk' as done." },
];

// The verdict must come back in this shape. No free text to parse.
const Verdict = z.object({
  passed: z.boolean().describe("true only if the page shows the expected result"),
  reason: z.string().describe("one sentence: what you saw on the page"),
}).meta({ title: "Verdict" }); // the model "answers" by calling a tool with this name

const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
const report = [];
for (const test of tests) {
  const page = await browser.newPage();
  const agent = createAgent({
    model: chatModel("05"),
    tools: browserTools(page),
    systemPrompt: "You are a QA tester. Do the steps in the browser, take a snapshot, " +
      "then decide if the expected result is on the page. Never guess: check the snapshot.",
    responseFormat: Verdict,
    middleware: [modelCallLimitMiddleware({ runLimit: 15 })],
  });
  const started = Date.now();
  const result = await agent.invoke(
    { messages: [{ role: "user", content: `Steps: ${test.steps}\nExpected: ${test.expected}` }] },
    { recursionLimit: 100 },
  );
  const { passed, reason } = result.structuredResponse ?? { passed: false, reason: "Stopped at the model call limit." };
  const calls = result.messages.flatMap((m) => (m as AIMessage).tool_calls ?? []).filter((c) => c.name !== "Verdict");
  console.log(`${test.name}:\n${calls.map((c) => `  ${c.name}(${JSON.stringify(c.args)})`).join("\n")}`);
  report.push({ test: test.name, result: passed ? "PASSED" : "FAILED", reason, actions: calls.length, seconds: (Date.now() - started) / 1000 });
  await page.close();
}
await browser.close();

console.table(report);
const md = report.map((r) => `- **${r.result}** ${r.test}: ${r.reason} (${r.actions} actions, ${r.seconds} s)`).join("\n");
await writeFile("report.md", `# Test report\n\n${md}\n`);
console.log("Saved report.md");
