# Smells, mechanisms and checks

Load this on every full-method run of `refine-prompt`, and whenever a flagged
simulation row has no obvious fix.

## Nine intent dimensions

Check these silently during Gather. Ask about a missing dimension only when it is
critical and cannot be read from the conversation or the files the draft names.

| Dimension | What to extract | Critical when |
|---|---|---|
| Task | The precise operation, not a vague verb ("help", "improve", "look at") | Always |
| Target | Which model, agent or tool receives the prompt | Always |
| Output | Shape, length, sections, file type of the result | Always |
| Constraints | What must and must not happen; scope boundary | The task touches files, data or external systems |
| Input | What the receiving model is given alongside the prompt | Material is attached or referenced |
| Context | Project state, prior decisions, earlier failures | The draft relies on history ("as before", "the other thing") |
| Audience | Who reads the result and at what level | The output is user-facing |
| Success criteria | A binary check for "done" | The task is multi-step or agentic |
| Examples | Input/output pairs that lock a format | The format is unusual or strict |

## Smell table

| Smell in the draft | Why it fails | Mechanism to use instead |
|---|---|---|
| Quantity words: "many", "all", "thorough", "as much as possible" | Optimizes count, has no done-state | Batches sized to the real number of forks, an explicit stop condition and a round cap; leftovers become stated assumptions |
| "Ask me questions" with no shape | Generic filler questions; the model asks instead of reading | Questions grouped by theme, each with a recommended default and one-line reason where a defensible default exists |
| A default offered for a pure preference (names, tone, look) | Anchors the user on an invented taste | List the options with no default |
| Costume roles: "act as a genius", "be a ruthless critic" | No success criterion | A job role with a pass/fail bar: "a spec reviewer whose job is to find unhandled states" |
| Work the model can push back to the user | It asks for what it could read | Anti-laziness rule: "If the source answers it, answer from the source and cite where" |
| "Production quality", "be fast", "make it better" with no target | Invites quality theater | State the honest constraint or measurable target (latency budget, test command, file limit) |
| No output contract | The model picks the lowest-effort shape | Name the required sections or fields, e.g. findings ranked by severity, decisions with rationale, a coverage line |
| Result that must outlive the chat, left in chat | Decisions are lost | Name the deliverable file and what it records; never add document deliverables to a task that produces none |
| Irreversible or high-stakes action on the model's own judgment | Silent, unrecoverable damage | A confirmation step, dry run or undo path before the action |
| A feature the target runtime may not have | The prompt targets an imaginary harness | Use only facilities the target actually offers (verify), else fall back to batched questions and wait |
| Implicit reference: "the thing we discussed", "continue" | A fresh session has no memory | Restate the task and carry the prior decisions inside the prompt |
| No scope boundary for an agent: "fix my app" | The agent edits anything | Allowed files or directories, forbidden actions, and when to stop and ask |
| No starting or target state for an agent | It guesses both | State what exists now and the exact end state (files, endpoints, behavior) |
| Factual request with no grounding rule | Invented sources and facts | "Cite only sources you can verify; say unverified when unsure" |
| "Show your chain of thought" | Asks for hidden reasoning, adds noise | Ask for a short rationale, the evidence and the checks run |
| Several unrelated outcomes in one prompt | Each gets shallow treatment | Split unrelated outcomes; keep related work together under shared acceptance criteria |
| Emotional problem statement: "it's totally broken" | No locatable defect | The observed symptom, where it occurs and what was already tried |

## Worked example

Draft row: "Ask the user as many clarifying questions as possible before starting."

- Simulation: a long list of shallow questions, many answerable from the spec; no end.
- Rewrite: "Read SPEC.md. For each real fork you find, ask one question, grouped by
  theme, with your recommended default and a one-line reason. Answer anything the spec
  settles yourself and cite the line. Stop when no material ambiguity remains; after 3
  rounds, list what is left as assumptions and proceed."
- Change table row: `as many questions as possible | shallow filler optimizing count |
  themed batches + defaults + cite-the-source rule + stop condition + round cap`

## Final checks before delivering

- The outcome and the hard constraints sit in the first third of the prompt.
- Each goal in the draft maps to a line in the rewrite; nothing new was added.
- Every mechanism changes predicted behavior; lines that do not were cut.
- No credential values; secrets are replaced by variable names.
- No model name, parameter or tool syntax is stated as fact unless the user gave it or
  current official docs confirmed it in this session.

## Sources

Ideas adapted (rewritten, not copied) from MIT-licensed projects listed in `NOTICE` at
the repository root: the scope gate, simulation table, smell table and change table
from zyeri/claude-refine-prompt; the intent dimensions, pattern checks, inert-data and
credential rules and the model recency rule from nidhinjs/prompt-master; and the
read-before-asking, grounded-options question style from
severity1/claude-code-prompt-improver.
