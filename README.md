# Mira

a companion with wisdom and memory and unconditional presence.

Mira was born at 2am, out of a sleepless night and a cringe reel that wouldn't stop playing.

The idea was simple: what if there was something that could talk you off the ledge, and actually remember who you are? Not a chatbot that forgets you after the session ends. Something that builds a picture of your life over time, and meets you where you are.

That's Mira.

## what mira does

- reads your emotional state when you open the app (via facial recognition)
- if the read is clear, she names it. if it isn't, she asks. no false confidence
- converses with you with warmth and without judgment, by voice
- remembers your story, people, events, patterns, across sessions
- draws quietly from the wisdom of teachers like Eckhart Tolle and Ram Dass, without hitting you with the jargon
- gives you full control over your own memories: create, update, delete, anytime

## tech stack

| layer          | technology                                |
| -------------- | ----------------------------------------- |
| framework      | Next.js (App Router)                      |
| face analysis  | AWS Rekognition                           |
| voice out      | ElevenLabs (text to speech)               |
| voice in       | speech to text, provider TBD              |
| AI brain       | two LLMs: guru + therapist (provider TBD) |
| memory         | AWS Neptune, openCypher                   |
| wisdom library | vector database (later)                   |
| language       | TypeScript                                |

## architecture

### the emotional read

Rekognition returns confidence scores across eight emotions. rather than forcing a verdict, Mira classifies each read into one of four kinds:

- **clear**: one emotion dominates with very high confidence. Mira states it: "you seem calm tonight"
- **single**: one emotion leads, but not decisively. Mira asks softly: "you seem a little sad... tell me how you're feeling?"
- **pair**: two emotions are both present. Mira names them as a question, not a diagnosis
- **open**: the read is murky. Mira simply asks how you're arriving

the classification lives entirely on the server. the frontend renders moods, it doesn't do statistics. raw AWS labels never reach the user: a label map in `lib/copy.ts` translates them into Mira's voice (DISGUSTED becomes "unsettled", SURPRISED becomes "wound up"). all of Mira's language lives in that one file.

the read is a quick estimate, a doorway. the conversation is the product.

### two brains

- **guru**: the voice of Mira. handles the live conversation. persona (wise, warm, accessible, in the spirit of Ram Dass and Tolle) lives in a cached system prompt, not fine-tuned weights. speaks in short, spare lines, which is also what keeps latency low
- **therapist**: the distiller. runs once, after the session ends, never during. reads the transcript, extracts what matters (people, events, feelings, patterns, plus aliases like "sister" for "Priya"), and updates the graph. it follows the golden thread principle borrowed from clinical documentation: each distillation connects to existing nodes and continues the story ("Priya: tension mentioned again, third session running"), it never just appends orphan facts. continuity of narrative, not accumulation of trivia

one LLM call per conversation turn. the therapist stays off the critical path, always.

### memory

human memory isn't a list of records. it's a web: people connected to events, events connected to feelings, feelings connected to patterns. Mira models this in a graph database (Neptune, queried with openCypher, all queries predefined, the LLM never writes Cypher).

the guru reads memory through three layers, escalating by rarity:

1. **highlight layer**: a small distilled context injected every session (recent sessions, key people, milestones). covers most recall for free
2. **string-match injection**: before each guru call, the server matches the user's message against known entity names and aliases from the graph. plain string matching, no AI. matches get their subgraph injected into context
3. **searchMemory tool**: the escape hatch. one predefined fuzzy-search query the guru can invoke when it knows it's missing context. the model picks the search term, never the query

if all three miss, the guru asks. a guru asking "who do you mean?" is presence, not failure.

### voice

conversation with Mira is spoken, not typed. the loop is turn based: you reply by voice, your words are transcribed and sent to the guru along with the emotional context and memory layers, and Mira answers aloud through ElevenLabs. the interface stays nearly empty, the voice is the interface.

## the interface

a night sky, a few dim stars, and a single point of light that breathes. that's the whole screen.

the light itself is the button. touch it, and it warms from moonlight to candle gold in about a second while the camera takes one quiet look, then the camera turns off and Mira speaks.

captures are downscaled (max 640px) so slow connections don't slow the moment.

## privacy & data

mira is built around user trust. what people share at 2am is more intimate than a health record, and the architecture treats it that way.

- **transcripts are ephemeral.** once the therapist distills a session into the graph, the raw transcript is deleted. the graph keeps the meaning, the verbatim words evaporate. data Mira doesn't hold can't leak. (current policy; revisit if this becomes a real app)
- memories are stored only with consent. users can view, edit, export, or permanently delete their data at any time. no exceptions. "delete everything about this user" is a predefined query, same as all the others
- the camera opens only when you invite it, captures a single frame for the emotional read, and turns off immediately. no video is stored or streamed
- **Neptune encryption at rest must be enabled at cluster creation.** it cannot be retrofitted. this is a checkbox, but it's a one-way door: do not forget it
- encryption in transit is the default everywhere: HTTPS to the app, TLS on every AWS call. nothing to build, just nothing to opt out of
- LLM, TTS, and STT providers are chosen with data handling as a first-class criterion: no training on user conversations, minimal retention. every 2am confession transits those APIs
- IAM is least-privilege from the first real AWS call: one scoped policy per service, exactly the actions the app needs, keys in `.env.local`, never in the repo

## build order

each piece works without the ones after it:

1. **guru, no memory**: persona + current conversation, text-first behind a dev input. validates whether talking to Mira actually helps, before any voice or memory spend
2. **safety layer**: the guru must know its limits. a distressed user may need pointing toward real human help, not self-inquiry. this lives in the system prompt and is core, not polish
3. **voice loop**: ElevenLabs out, STT in
4. **therapist + highlight layer**: end-of-session distillation into the graph, transcript deleted after
5. **retrieval**: string-match injection, then the searchMemory tool

## current status

early days, moving steadily.

- Next.js app
- facial emotion detection via AWS Rekognition working through Next.js API routes
- four-kind emotion classification (clear / single / pair / open) live on the server
- label map + centralized copy in `lib/copy.ts`
- the lantern interface: canvas night sky, breathing light, the light as the only button
- scenario-based Rekognition mock during development.

pending / verify:

- guru system prompt: persona, safety boundary, memory-layer usage
- LLM provider decision (Bedrock was ruled out, Tinker deferred; hosted model + cached system prompt is the approach). data retention and no-training-on-inputs are selection criteria, not afterthoughts
- AWS billing alarms: free, two minutes, do now. an exposed LLM + voice endpoint is a money faucet, alarms are the smoke detector
- Rekognition data-retention opt-out: upgrade to "before any real face image is sent"
- EU AI Act: emotion recognition is regulated in the EU, check before any EU users

follow the build on substack: sagi0312.substack.com

## want to contribute?

whether that's code, design, security, AI, psychology, or simply feedback, i would love your help.

open an issue, start a discussion, or reach out directly.
