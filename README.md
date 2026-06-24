# Mira

> *a companion with wisdom and memory and unconditional presence.*

Mira was born at 2am, out of a sleepless night and a cringe reel that wouldn't stop playing.

The idea was simple: what if there was something that could talk you off the ledge — and actually remember who you are? Not a chatbot that forgets you the moment the session ends. Something that builds a picture of your life over time, and meets you where you are.

That's Mira.

---

## what mira does

- reads your emotional state when you open the app (via facial recognition)
- converses with you with warmth and without judgment
- remembers your story — people, events, patterns — across sessions
- draws quietly from the wisdom of teachers like Eckhart Tolle and Ram Dass, without hitting you with the jargon
- gives you full control over your own memories: create, update, delete, anytime

---

## tech stack

| layer | technology |
|---|---|
| frontend | React |
| backend | Node.js / Express |
| face analysis | AWS Rekognition |
| voice | AWS Polly (ElevenLabs planned) |
| AI brain | AWS Bedrock |
| memory | Graph Database |
| wisdom library | Vector Database |
| language | TypeScript |

---

## architecture

human memory isn't a list of records. it's a web — people connected to events, events connected to feelings, feelings connected to patterns. Mira uses a graph database to model this more faithfully.

after each session, Mira distills the conversation, extracts what matters, and stores it securely. encryption is baked in from day one.

---

## privacy

mira is built around user trust.

memories are stored only with consent. users can view, edit, export, or permanently delete their data at any time. no exceptions.

---

## current status

early days. the React frontend and Node.js backend are live. facial emotion detection via AWS Rekognition is working.

next: Bedrock and Polly.

follow the build on substack: [sagi0312.substack.com](https://sagi0312.substack.com)

---

## want to contribute?

whether that's code, design, security, AI, psychology, or simply feedback — i would love your help.

open an issue, start a discussion, or reach out directly.
