# 4. Why Your AI Agent Forgets the Task (and Runs Up the Bill)

Video 4 of 5 in **Build Your Own Browser AI Agent**. [Watch the video]([video 4 link])

A model remembers nothing: every call resends the whole list, and a browser agent's list fills with old page snapshots. You keep the context small and the bill visible.

## What you learn

- `forgetOldSnapshots` replaces every older snapshot with one short line, in the context only (the state keeps them).
- A `note` tool and a `notes` field with its own reducer, put into the system message on every call.
- Token counting from `usage_metadata`, and a `recursionLimit` brake with `GraphRecursionError` caught.
- The output shows the context size with and without forgetting, call by call.

## Files

- `04-memory.ts`: the lesson's code, exactly as in the video.
- `model.ts`: picks the model: Gemini with your key, or a scripted stand-in (`MODEL=fake`).
- `fake.ts`: the scripted stand-in model, for runs without a key.
- `03-tools.ts`: the browser tools from lesson 3, copied so this folder runs on its own.
- `exercises/`: your turn; `exercises/solutions/`: the answer.

## Run it

Node 22.9 or newer.

```sh
npm install
npx playwright install chromium     # once per computer
cp .env.example .env                 # put your key in GOOGLE_API_KEY (free: https://aistudio.google.com/apikey)
npm run 04                          # as in the video (same as: npm start)
```

No key? Run it with the model simulated and the browser real:

```sh
npm run fake
```

Watch the browser: `HEADED=1 npm run 04`.

## What you should see

### With a real model

The real output of `npm start` with Gemini (`gemini-3.5-flash-lite`), run on 2026-11-09. Your run can word things differently.

```text
agent: context 176 chars (176 without forgetting), tokens in 380 out 26
  navigate({"url":"https://demo.playwright.dev/todomvc/"}) -> Opened https://demo.playwright.dev/todomvc/#/
agent: context 221 chars (221 without forgetting), tokens in 432 out 8
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 911 chars (911 without forgetting), tokens in 707 out 26
  type({"ref":"e8","submit":true,"text":"Buy milk"}) -> Typed "Buy milk" and pressed Enter.
agent: context 946 chars (946 without forgetting), tokens in 753 out 27
  type({"submit":true,"ref":"e8","text":"Walk the dog"}) -> Typed "Walk the dog" and pressed Enter.
agent: context 985 chars (985 without forgetting), tokens in 801 out 26
  type({"submit":true,"text":"Call mum","ref":"e8"}) -> Typed "Call mum" and pressed Enter.
agent: context 1020 chars (1020 without forgetting), tokens in 847 out 29
  note({"text":"Added todos: 'Buy milk', 'Walk the dog', 'Call mum'"}) -> Saved.
agent: context 1067 chars (1067 without forgetting), tokens in 901 out 8
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 2263 chars (2931 without forgetting), tokens in 1339 out 16
  click({"ref":"e29"}) -> Clicked.
agent: context 2271 chars (2939 without forgetting), tokens in 1368 out 8
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 2384 chars (4894 without forgetting), tokens in 1424 out 37
Agent: I have added 'Buy milk', 'Walk the dog', and 'Call mum' to the TodoMVC list, noted what was added, and marked 'Call mum' as completed.
Notes: Added todos: 'Buy milk', 'Walk the dog', 'Call mum'
Tokens used: 9163
```

### Without a key

The real output of `npm run fake` (model simulated, browser real), same day:

```text
[model simulated, browser real] lesson 04
agent: context 176 chars (176 without forgetting), tokens in 44 out 27
  navigate({"url":"https://demo.playwright.dev/todomvc/"}) -> Opened https://demo.playwright.dev/todomvc/#/
agent: context 221 chars (221 without forgetting), tokens in 84 out 16
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 911 chars (911 without forgetting), tokens in 274 out 26
  type({"ref":"e8","text":"Buy milk","submit":true}) -> Typed "Buy milk" and pressed Enter.
agent: context 946 chars (946 without forgetting), tokens in 310 out 16
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 1793 chars (2461 without forgetting), tokens in 539 out 27
  type({"ref":"e8","text":"Walk the dog","submit":true}) -> Typed "Walk the dog" and pressed Enter.
agent: context 1832 chars (2500 without forgetting), tokens in 577 out 16
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 2031 chars (4192 without forgetting), tokens in 644 out 26
  type({"ref":"e8","text":"Call mum","submit":true}) -> Typed "Call mum" and pressed Enter.
agent: context 2066 chars (4227 without forgetting), tokens in 680 out 16
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 2260 chars (6091 without forgetting), tokens in 746 out 30
  note({"text":"Added 3 todos: Buy milk, Walk the dog, Call mum."}) -> Saved.
agent: context 2304 chars (6135 without forgetting), tokens in 788 out 19
  click({"ref":"e39"}) -> Clicked.
agent: context 2312 chars (6143 without forgetting), tokens in 810 out 17
  snapshot({}) -> - generic [ref=e1]: - generic [ref=e2]: - text: This is just
agent: context 2425 chars (8098 without forgetting), tokens in 856 out 7
Agent: All done. 2 items left.
Notes: Added 3 todos: Buy milk, Walk the dog, Call mum.
Tokens used: 6595
```

## Your turn

Which snapshot do you keep? Fill in line 25 so the last context line says 2425 chars.

Before you fill it in, the last context line says `708 chars`. The solution's says `2425 chars (8098 without forgetting)`.

```sh
npm run ex04          # your version, as in the video (same as: npm run your-turn)
npm run solution      # the answer
```

## Check

`npm run check` type-checks everything (TypeScript, no build step).
