# 1. A Browser Agent in 40 Lines

Video 1 of 5 in **Build Your Own Browser AI Agent**. [Watch the video]([video 1 link])

A chatbot can only write text; an agent acts. You build a whole browser agent in about forty lines: a model, one tool (`navigate`, driving a real Chromium with Playwright) and a loop.

## What you learn

- A tool call is just JSON your code runs; the result goes back to the model as a `ToolMessage` with the same id.
- The loop is think → act → observe. No tool call means "I'm done". A step limit is the fuse.
- `model.ts`: without `GOOGLE_API_KEY`, `ChatGoogle` would quietly use your gcloud login (Vertex AI) and bill that project, so the code refuses to start instead.

## Files

- `01-hello-agent.ts`: the lesson's code, exactly as in the video.
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

This is the real output of `npm run fake` (model simulated, browser real), copied from a run on 2026-11-09. With a real model the steps and words can differ.

```text
[model simulated, browser real] lesson 01
step 1: navigate({"url":"https://demo.playwright.dev/todomvc/"})
  -> Opened https://demo.playwright.dev/todomvc/. The page title is "React • TodoMVC".
Agent: Done. Opened https://demo.playwright.dev/todomvc/. The page title is "React • TodoMVC".
```

## Your turn

Fill in the stop line (line 30) so the loop ends when the model stops asking for tools. Before you fix it, it calls the model until the step limit.

```sh
npm run your-turn     # your version
npm run solution      # the answer
```

## Check

`npm run check` type-checks everything (TypeScript, no build step).
