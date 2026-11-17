# English AI-writing patterns

Each entry gives the tell, why it reads as machine-made, a rewrite that changes the
sentence's structure (not just its words), and when the pattern is legitimate.
Strength: **strong** justifies an edit on one sighting; **weak** needs company from other
tells in the same passage. Scanner rule ids are in brackets.

Swapping one stock phrase for a synonym is not a fix. Rewrite the thought.

## A. Staging instead of stating

### A1. Not X but Y (strong) [en.not-x-but-y, en.split-contrast, en.not-but-correction]
"It's not just X, it's Y", "not only X but Y", "This doesn't mean X. It means Y", a clipped
negative tail (", no guesswork"). The negative half names something nobody claimed so the
positive half looks bigger.
- Before: It's not just a scheduler; it's a whole new way to run your team.
- After: The scheduler also changes how the team runs. (Ask what changes; do not invent it.)
- Legitimate: the reader actually holds belief X, or both halves carry information.

### A2. One-line closers and fragment rows (strong) [en.closer]
"That is the real win." "Let that sink in." "The message was clear:". A row like
"No fluff. No filler. Just results." The line asks for a pause instead of adding a fact.
- Before: Retries hide brief outages. That's the real win.
- After: Retries hide brief outages.
- Legitimate: the short line adds a new fact or consequence.

### A3. Sayings that sound deep (strong) [en.deep-saying]
"At its core", "the real question is", "X is the language of Y", "not a tool but a mirror".
- Before: At its core, trust is the currency of teams.
- After: People trust colleagues who have delivered before.

### A4. Run-up before the point (strong) [en.run-up]
"Let's dive in", "Here's the thing", "Honestly?", "In this article we will".
- Before: Let's break down how the cache works. Here's what you need to know.
- After: The cache keeps each response for five minutes, keyed by URL.
- Legitimate: "honestly" or "look" inside an ordinary casual sentence.

### A5. Arguing with no one (medium) [en.no-one-argued]
"To be clear", "Don't get me wrong", "A tempting approach would be…". Answers an objection
that appears nowhere else.
- Legitimate: the objection is real, attributed, and answered.

## B. Rhythm by rule

### B1. Forced triads (weak alone) [en.triad]
Lists of three adjectives, three examples, three short facts then a moral.
- Before: Fast, reliable, and scalable.
- After: keep the one quality the text supports, or ask for the measurement behind it.
- Legitimate: the content has exactly three parts.

### B2. Repeated sentence openings (weak) [en.same-opening]
Three sentences in a row starting "She…" or "This…". Merge or begin with the action.
Deliberate anaphora is fine.

### B3. Dashes as universal connector (weak alone) [en.dash]
Em dashes and spaced double hyphens everywhere. Pick the real relation: comma, colon,
parentheses, period. If the writer's sample uses dashes, keep their rate. Number ranges
(10–12) are not tells.

### B4. Stacked qualifiers (weak) [en.hedge-stack]
"could potentially", "might arguably". Keep one hedge when the doubt is real; keep legal
and safety caveats.

## C. Inflation and borrowed authority

### C1. Stock AI vocabulary (medium) [en.ai-word]
delve, tapestry, testament, pivotal, intricate, meticulous, showcase, interplay, vibrant,
seamless, elevate, embark, realm, "in today's fast-paced world". One on its own proves
little; three in a paragraph is a pattern. Technical senses (robust statistics) are fine.

### C2. Inflated significance (medium) [en.inflation]
"plays a crucial role", "marking a pivotal moment", "the future looks bright",
"continues to thrive". Keep the fact, drop the significance, end on the last concrete fact.
- Before: Founded in 1989, the institute marked a pivotal moment for regional statistics.
- After: The institute was founded in 1989.
- Significance tails like this assert nothing checkable: cut by default and list the cut.

### C3. Sales language (medium) [en.sales]
nestled, in the heart of, breathtaking, must-visit, world-class, cutting-edge. Say what
the thing is and where it is. Placement decoration ("nestled in the heart of") is fixed by
default. The author's evaluations ("breathtaking", "world-class", "must-visit") keep their
strength unless the user asks for plain wording; "make it natural" is not that request.
- Before: Nestled in the heart of the valley, the inn is a must-visit.
- After (default): The inn sits in the valley and is well worth the trip.
- After (plain wording requested): The inn is in the valley.

### C4. Borrowed authority (judge by hand)
"Experts say", "studies show", a list of outlets that featured someone. Name the source and
what it said if you know it. Otherwise keep the claim with its attribution and flag the
missing source outside the text; cut it only when the user asks.

### C5. Avoiding is/has (weak) [en.copula-avoid]
"serves as", "stands as", "boasts", "features". Use is, are, has.

### C6. Vague links (weak) [en.vague-link]
"associated with", "in connection with". Name the relationship if you know it.

### C7. Shallow -ing tails (weak) [en.ing-tail]
", highlighting the importance of…", ", reflecting a deep commitment to…". Delete unless a
source supports the claim.

## D. Formatting by rule

### D1. Bold labels on every list item (medium) [en.bold-label]
"- **Speed:** It is faster." If the labels add nothing, write one sentence.

### D2. Decorative headings (weak/medium) [en.title-case, en.emoji-decor]
Title Case Headings, emoji or arrows on headings and bullets, a rule between every
section. Use sentence case; drop the decoration.

### D3. Curly quotes (info only) [en.curly-quote]
Match the target format. Never a tell on its own.

## E. Leftovers

### E1. Chatbot wrapper (strong) [en.chatbot]
"Great question!", "I hope this helps", "Let me know if…", "Would you like me to…".
Remove the wrapper, keep the content.

### E2. Knowledge-limit hedges (medium) [en.knowledge-limit]
"as of my last update", "not extensively documented… it appears". Say what the source does
not show, or cut the sentence. Never replace a gap with a plausible guess.

### E3. Heading echoed by the first sentence (judge by hand)
"## Performance" followed by "Performance matters." Delete the echo.

### E4. Writing about the document (judge by hand)
"The table below compares…", "This section was added to replace…". Keep it only when the
reader cannot see it themselves or the document is a changelog.

## F. Wrong reader (judge by hand)
A reply that restates the problem, the diagnosis and the evidence before reaching the
decision. Lead with the decision, keep the one fact the reader lacks.
