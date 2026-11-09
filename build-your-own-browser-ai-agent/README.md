# Build Your Own Browser AI Agent

Five videos, five folders. Each folder runs on its own: open it, install, run.

| # | Lesson | You build |
|---|---|---|
| 1 | [A Browser Agent in 40 Lines](01-hello-agent) | the agent loop: a model, one tool, a loop |
| 2 | [Your AI Agent Is a Graph](02-graph) | the same loop as a LangGraph `StateGraph` |
| 3 | [How an AI Agent Sees a Web Page](03-tools) | eyes and hands: snapshot, click, type |
| 4 | [Why Your AI Agent Forgets the Task](04-memory) | memory that stays small, notes, token counts, a brake |
| 5 | [Inside Endorphin: an AI Agent That Tests Websites](05-test-agent) | a mini test agent with verdicts and a report |

Stack: TypeScript on Node 22.9+, LangChain JS and LangGraph JS, Gemini (`gemini-3.5-flash-lite` by default), Playwright with Chromium. The demo site is https://demo.playwright.dev/todomvc/, run by the Playwright team.

## Every folder

```sh
cd 01-hello-agent
npm install
npx playwright install chromium   # once per computer
cp .env.example .env              # your GOOGLE_API_KEY
npm start                         # or, with no key: npm run fake
```

## How this code was checked

Every folder was installed fresh, type-checked (`npm run check`) and run on a Mac (Node 22.18, 2026-11-09) three ways: `npm start` with a real Gemini key (`gemini-3.5-flash-lite`), `npm run fake` (the model simulated by a script, the browser real) and `npm run solution` for the exercise. Lesson 1 was also checked from a fresh clone of this repo. The outputs in each README are copied from those runs; a real model can word its answers differently.
