# 2. Your AI Agent Is a Graph

Video 2 of 5 in **Build Your Own Browser AI Agent**. [Watch the video]([video 2 link])

The same loop from lesson 1, rebuilt as a LangGraph `StateGraph`: START → agent → tools → agent → … → END.

## What you learn

- State: the messages list, with a reducer that appends.
- Nodes are plain async functions you can unit-test; `ToolNode` runs the tool calls.
- The conditional edge is lesson 1's `if (no tool calls) break` with a name.
- `recursionLimit` counts graph steps, not model calls (this file sets 10).

## Files

- `02-graph.ts`: the lesson's code, exactly as in the video.
- `model.ts`: picks the model: Gemini with your key, or a scripted stand-in (`MODEL=fake`).
- `fake.ts`: the scripted stand-in model, for runs without a key.
- `exercises/`: your turn; `exercises/solutions/`: the answer.

## Run it

Node 22.9 or newer.

```sh
npm install
npx playwright install chromium     # once per computer
cp .env.example .env                 # put your key in GOOGLE_API_KEY (free: https://aistudio.google.com/apikey)
npm start
```

No key? Run it with the model simulated and the browser real:

```sh
npm run fake
```

Watch the browser: `HEADED=1 npm start`.

## What you should see

### With a real model

The real output of `npm start` with Gemini (`gemini-3.5-flash-lite`), run on 2026-11-09. Your run can word things differently.

```text
human: Go to https://demo.playwright.dev/todomvc/ and tell me the page title.
ai: [{"type":"tool_call","id":"call_8701758600445279206","name":"navigate","args":{"url":"https://demo.playwright.dev/todomvc/"},"thoughtSignature":"EmAKXgFpFH0TXNNCF3yrmFsDVp9Vy6h55tpU9f8+xdYZGah5AIV…
tool: Opened https://demo.playwright.dev/todomvc/. The page title is "React • TodoMVC".
ai: The page title is "React • TodoMVC".
```

The long `thoughtSignature` in the tool-call line is Gemini's own bookkeeping for its reasoning; LangChain passes it back on the next call. You can ignore it.

Before you fill it in, `npm run your-turn` reports 1 of 2 tests failing ("next picks tools"); `npm run solution` passes both.

### Without a key

The real output of `npm run fake` (model simulated, browser real), same day:

```text
[model simulated, browser real] lesson 02
human: Go to https://demo.playwright.dev/todomvc/ and tell me the page title.
ai: [{"name":"navigate","args":{"url":"https://demo.playwright.dev/todomvc/"},"id":"call_1","type":"tool_call"}]
tool: Opened https://demo.playwright.dev/todomvc/. The page title is "React • TodoMVC".
ai: Done. Opened https://demo.playwright.dev/todomvc/. The page title is "React • TodoMVC".
```

## Your turn

Write a unit test for `next()`, the edge that decides between tools and END (fill in line 16).

```sh
npm run your-turn     # your version
npm run solution      # the answer
```

## Check

`npm run check` type-checks everything (TypeScript, no build step).
