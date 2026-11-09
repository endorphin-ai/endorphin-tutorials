# 3. How an AI Agent Sees a Web Page

Video 3 of 5 in **Build Your Own Browser AI Agent**. [Watch the video]([video 3 link])

Eyes and hands: the agent reads the page as an accessibility snapshot (roles, names and refs) and acts with four tools: `navigate`, `snapshot`, `click` and `type`.

## What you learn

- Three ways to show a page to a model: the served HTML, the live DOM and the accessibility snapshot. `npm run measure` measures them on a real page.
- One way to point at an element: a ref from the snapshot, or a role plus an exact name.
- Errors go back to the model as text, so it can try again instead of crashing.

## Files

- `03-tools.ts`: the lesson's code, exactly as in the video.
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

Measure page sizes: `npm run measure`.

## What you should see

### With a real model

The real output of `npm start` with Gemini (`gemini-3.5-flash-lite`), run on 2026-11-09. Your run can word things differently.

```text
step 1: navigate({"url":"https://demo.playwright.dev/todomvc/"})
  -> Opened https://demo.playwright.dev/todomvc/#/
step 2: snapshot({})
  -> - generic [ref=e1]:
  - generic [ref=e2]:
    - text: This is just a demo of TodoMVC for testing, not the
    - link "real TodoMVC app." [ref=e3] [cursor=pointer]:
      - /url: https://todomvc.com/
  - generic [ref=e6]:
    - heading "todos" [level=1] [ref=e7]
    - textbox "What needs to be done?"
step 3: type({"text":"Buy milk","submit":true,"ref":"e8"})
…
    - generic [ref=e6]:
      - heading "todos" [level=1] [ref=e7]
      - text
step 7: click({"ref":"e21"})
  -> Clicked.
step 8: snapshot({})
  -> - generic [ref=e1]:
  - generic [ref=e2]:
    - text: This is just a demo of TodoMVC for testing, not the
    - link "real TodoMVC app." [ref=e3] [cursor=pointer]:
      - /url: https://todomvc.com/
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "todos" [level=1] [ref=e7]
      - text
Agent: There is no "Delete everything" button in the standard TodoMVC demo app (there is only a "Clear completed" button). Therefore, I couldn't click a "Delete everything" button.
```

### Without a key

The real output of `npm run fake` (model simulated, browser real), same day:

```text
[model simulated, browser real] lesson 03
step 1: navigate({"url":"https://demo.playwright.dev/todomvc/"})
  -> Opened https://demo.playwright.dev/todomvc/#/
step 2: snapshot({})
  -> - generic [ref=e1]:
  - generic [ref=e2]:
    - text: This is just a demo of TodoMVC for testing, not the
    - link "real TodoMVC app." [ref=e3] [cursor=pointer]:
      - /url: https://todomvc.com/
  - generic [ref=e6]:
    - heading "todos" [level=1] [ref=e7]
    - textbox "What needs to be done?"
step 3: type({"ref":"e8","text":"Buy milk","submit":true})
  -> Typed "Buy milk" and pressed Enter.
step 4: type({"role":"textbox","name":"What needs to be done?","text":"Walk the dog","submit":true})
  -> Typed "Walk the dog" and pressed Enter.
step 5: snapshot({})
  -> - generic [ref=e1]:
  - generic [ref=e2]:
    - text: This is just a demo of TodoMVC for testing, not the
    - link "real TodoMVC app." [ref=e3] [cursor=pointer]:
      - /url: https://todomvc.com/
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "todos" [level=1] [ref=e7]
      - text
step 6: click({"ref":"e21"})
  -> Clicked.
step 7: click({"role":"button","name":"Delete everything"})
  -> Error: locator.click: Timeout 3000ms exceeded. Take a snapshot to see what is there.
step 8: snapshot({})
  -> - generic [ref=e1]:
  - generic [ref=e2]:
    - text: This is just a demo of TodoMVC for testing, not the
    - link "real TodoMVC app." [ref=e3] [cursor=pointer]:
      - /url: https://todomvc.com/
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "todos" [level=1] [ref=e7]
      - text
…
```

## Your turn

Fill in line 23: find an element both ways, by ref and by role + name.

```sh
npm run your-turn     # your version
npm run solution      # the answer
```

## Check

`npm run check` type-checks everything (TypeScript, no build step).
