// How big is a page for the model? Raw HTML vs the aria snapshot. Tokens = chars / 4 (an estimate).
import { chromium, type Page } from "playwright";

const row = (label: string, text: string) =>
  console.log(`${label.padEnd(34)} ${String(text.length).padStart(9)} chars  ~${String(Math.round(text.length / 4)).padStart(7)} tokens`);

async function measure(page: Page, title: string, served: string) {
  console.log(`\n${title}  (${page.url()})`);
  row("HTML as served (view-source)", served);
  row("HTML after JavaScript (DOM)", await page.content());
  row("aria snapshot (default)", await page.ariaSnapshot());
  row("aria snapshot (mode: ai, refs)", await page.ariaSnapshot({ mode: "ai" }));
}

const browser = await chromium.launch();
const page = await browser.newPage();
console.log(`measured ${new Date().toISOString()} with Chromium ${browser.version()} (Playwright 1.64.1)`);

let res = await page.goto("https://demo.playwright.dev/todomvc/");
const served = (await res!.text());
await measure(page, "TodoMVC demo, empty", served);
for (const t of ["Buy milk", "Walk the dog", "Call mum"]) await page.getByPlaceholder("What needs to be done?").fill(t), await page.keyboard.press("Enter");
await measure(page, "TodoMVC demo, 3 todos", served);

res = await page.goto("https://en.wikipedia.org/wiki/Web_browser");
await measure(page, "A real content page: Wikipedia 'Web browser'", await res!.text());
await browser.close();
