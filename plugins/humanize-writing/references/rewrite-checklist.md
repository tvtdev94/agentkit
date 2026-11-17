# Rewrite checklist

Run this after drafting and before returning the final text.

## 1. Facts survived (blocking)
Compare draft with source, item by item:
- names, numbers, units, dates, prices, versions, percentages;
- quotes (verbatim), citations, links, footnotes;
- rankings and comparisons ("the largest", "faster than");
- claims that two things happen together or one causes the other;
- real hedges and scope limits ("in our tests", "may", legal or safety notes);
- negations (a dropped "không" / "not" flips the meaning).

Any lost or changed item is an error. Restore it unless a pattern explicitly says to cut
that sentence (for example a chatbot wrapper). Never add a fact, number, source or anecdote
you do not have; ask for it or write a plainer sentence.

`scripts/check-facts.py SOURCE REWRITE` checks numbers (1.250 = 1250, 12,5 = 12.5, "ba" = 3),
URLs, link targets, inline code, code blocks and front matter, and warns when meaning-bearing
words drop (chưa, vẫn, chỉ, có thể / not, only, may) or a likely name disappears. It cannot
see a changed claim with the same numbers, so still compare by reading.

## 2. Untouchable spans
Code blocks, inline code, commands, file paths, URLs, link targets, YAML front matter,
tables of data, and proper names stay byte-identical.

## 3. Read it aloud
Ask what still sounds generated. The tells that most often survive a first pass:
- contrasts (not X but Y / không chỉ… mà còn);
- one-line closers and summary paragraphs ("Tóm lại", "In short");
- triads;
- dashes;
- bold labels and decorative headings.

## 4. Voice
- With a writing sample: sentence length, word choice, punctuation (including dashes),
  openings and transitions match the sample. The sample beats every pattern rule.
- Without a sample: personal and opinion writing keeps the writer's opinions, doubts and
  asides; reference, technical and legal text stays neutral and plain.
- Sentence length varies. Not every paragraph ends on a punchline.

## 5. Scanner second opinion (optional)
Run `scripts/scan-ai-tells.py` on the final text. For each remaining finding, either fix
the sentence or note why it stays (quotation, proper name, deliberate choice). Do not loop
until the score drops: the score counts surface tells only, and a low score does not mean
the text reads as human.

## 6. Report
Return what the mode asks for. If you could not cover part of a file, say which part.
