# VoiceLog

Talk your standup. Get a clean dev log.

Live: https://voicelog-aman.vercel.app

Writing standup notes is the part of the day nobody wants to type. VoiceLog lets you just talk. You ramble about what you did, what's next and what's stuck, and it gives you a clean entry split into Yesterday, Today, Blockers and Notes, saved to a searchable timeline.

Built for the WeMakeDevs x Wispr Flow "No Hands" challenge, Builders track.

## What it does

- Takes rambling speech in a plain text box
- Strips fillers (um, uh, you know, basically) and repeated words
- Splits it into sentences and sorts each one into Yesterday, Today, Blockers or Notes
- Picks up tags from `#backend` or a spoken "hashtag backend"
- Saves entries to a timeline you can search by text or tag
- Copies any entry as a Markdown standup, or exports the whole log as `.md`

## How Wispr Flow fits in

Wispr Flow types wherever your cursor is. Click the box, hold your Flow hotkey and talk. Flow drops cleaned up text in, and VoiceLog structures it. No plugin, no integration, it is just a text field.

No Flow? The "Browser mic" button uses the Web Speech API (works in Chrome and Edge).

## Stack

- Next.js 16 (App Router), React 19, plain CSS
- Rule based formatter in `lib/format.mjs`, tested with `node --test`
- localStorage for data. No backend, no account, no paid API, no LLM
- Hosted on Vercel

The formatter never adds anything. Every line in an entry is a sentence you said, cleaned up and sorted.

## Run it

```bash
git clone https://github.com/amantebriwal4321/voicelog
cd voicelog
npm install
npm run dev   # http://localhost:4400
npm test
```

## License

MIT
