# 5. Inside Endorphin: How I Built an AI Agent That Tests Websites

Video 5 of 5 in **Build Your Own Browser AI Agent**. [Watch the video]([video 5 link])

A mini test agent in one file: tests written in plain English, a verdict in a fixed shape (no free text to parse), and a small report, the core ideas of Endorphin, the author's open-source test framework.

## What you learn

- Tests as data; each run uses lesson 3's browser tools (`03-tools.ts` is a copy of lesson 3).
- The verdict comes back in a fixed schema (`passed` and a one-sentence `reason`), never as free text to parse.
- A test that is wrong on purpose must FAIL: an AI tester that passes it can't be trusted.
- `report.md` is written next to the code.

## Files

- `05-test-agent.ts`: the lesson's code, exactly as in the video.
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
[model simulated, browser real] lesson 05
Complete a todo:
  navigate({"url":"https://demo.playwright.dev/todomvc/"})
  snapshot({})
  type({"ref":"e8","text":"Buy milk","submit":true})
  type({"ref":"e8","text":"Walk the dog","submit":true})
  snapshot({})
  click({"ref":"e21"})
  snapshot({})
[model simulated, browser real] lesson 05
Wrong on purpose:
  navigate({"url":"https://demo.playwright.dev/todomvc/"})
  snapshot({})
  type({"ref":"e8","text":"Buy milk","submit":true})
  type({"ref":"e8","text":"Walk the dog","submit":true})
  snapshot({})
  click({"ref":"e21"})
  snapshot({})
┌─────────┬────────────────────┬──────────┬────────────────────────────────────────────┬─────────┬─────────┐
│ (index) │ test               │ result   │ reason                                     │ actions │ seconds │
├─────────┼────────────────────┼──────────┼────────────────────────────────────────────┼─────────┼─────────┤
│ 0       │ 'Complete a todo'  │ 'PASSED' │ 'The footer says 1 item left; expected 1.' │ 7       │ 0.383   │
│ 1       │ 'Wrong on purpose' │ 'FAILED' │ 'The footer says 1 item left; expected 2.' │ 7       │ 0.372   │
└─────────┴────────────────────┴──────────┴────────────────────────────────────────────┴─────────┴─────────┘
Saved report.md
```

## Your turn

Fill in line 14: a wrong number must print FAILED, and 1 must print PASSED.

```sh
npm run your-turn     # your version
npm run solution      # the answer
```

## Check

`npm run check` type-checks everything (TypeScript, no build step).
