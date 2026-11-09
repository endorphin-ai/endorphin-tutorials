// Your turn 03 · Fill in line 23 (both ways to find an element), then run: npm run ex03
import { chromium, type Locator, type Page } from "playwright";
import { tool, HumanMessage, type BaseMessage, type StructuredTool } from "langchain";
import { z } from "zod";
import { chatModel } from "../model.ts";

const MAX_CHARS = 3000; // the most snapshot text the model may see
const trim = (s: string) => (s.length > MAX_CHARS ? s.slice(0, MAX_CHARS) + "\n…(cut)" : s);

// Errors go back to the model as text, so it can try again instead of crashing.
const safe = (run: () => Promise<string>) =>
  run().catch((e: Error) => `Error: ${e.message.split("\n")[0]} Take a snapshot to see what is there.`);

const Target = z.object({
  ref: z.string().optional().describe("ref from the snapshot, like e8"),
  role: z.string().optional().describe("ARIA role, like button, link, textbox"),
  name: z.string().optional().describe("accessible name, like Sign in"),
});

export function browserTools(page: Page): StructuredTool[] {
  page.setDefaultTimeout(3000); // fail fast: a wrong guess costs 3 s, not 30
  const find = ({ ref, role, name }: z.infer<typeof Target>): Locator =>
    undefined as unknown as Locator; // ___ your turn: ref ? page.getByRef(ref) : page.getByRole(role as "button", { name, exact: true })

  return [
    tool(({ url }) => safe(async () => { await page.goto(url); return `Opened ${page.url()}`; }),
      { name: "navigate", description: "Open a URL.", schema: z.object({ url: z.string() }) }),
    tool(() => safe(async () => trim(await page.ariaSnapshot({ mode: "ai" }))),
      { name: "snapshot", description: "See the page: roles, names and refs.", schema: z.object({}) }),
    tool((t) => safe(async () => { await find(t).click(); return "Clicked."; }),
      { name: "click", description: "Click by ref, or by role + name.", schema: Target }),
    tool(({ text, submit, ...t }) => safe(async () => {
        await find(t).fill(text);
        if (submit) await find(t).press("Enter");
        return `Typed "${text}"${submit ? " and pressed Enter" : ""}.`;
      }),
      { name: "type", description: "Type into a field by ref, or by role + name.",
        schema: Target.extend({ text: z.string(), submit: z.boolean().optional() }) }),
  ];
}

if (import.meta.filename === process.argv[1]) {
  const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
  const tools = browserTools(await browser.newPage());
  const model = chatModel("03").bindTools(tools);
  const messages: BaseMessage[] = [new HumanMessage(
    "On https://demo.playwright.dev/todomvc/ add 'Buy milk' and 'Walk the dog', mark 'Buy milk' done, " +
    "click the 'Delete everything' button, then tell me how many items are left.")];

  for (let step = 1; step <= 15; step++) {
    const reply = await model.invoke(messages);
    messages.push(reply);
    if (!reply.tool_calls?.length) break;
    for (const call of reply.tool_calls) {
      const result = await tools.find((t) => t.name === call.name)!.invoke(call);
      console.log(`step ${step}: ${call.name}(${JSON.stringify(call.args)})\n  -> ${result.text.slice(0, 300)}`);
      messages.push(result);
    }
  }
  console.log("Agent:", messages.at(-1)!.text);
  await browser.close();
}
