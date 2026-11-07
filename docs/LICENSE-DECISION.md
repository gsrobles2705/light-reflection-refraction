# License decision (pending)

The project has **no license yet**, and the copyright holder has not been specified. Do not assume either: this needs to
be decided by the people who own the work (the student team, the school or the instructor).

## Options

| License | What it allows | Good fit when… |
|---|---|---|
| **MIT** | Anyone can use, modify and redistribute (even commercially) if the copyright notice is kept | You want maximum reuse and no obligations for others. Simple and common for educational web projects |
| **Apache-2.0** | Same as MIT, plus an explicit patent grant and notice requirements | You want the same openness with more legal clarity |
| **GPL-3.0** | Others may reuse the code only if derivative works are released under the same license | You want improvements to stay open |
| **CC BY 4.0** (for text/diagrams only, not for code) | Others may reuse the content with attribution | You want to share the written content (history, explanations) separately from the code |
| **No license (all rights reserved)** | Nobody may reuse it without asking | The work must stay private to the school/course |

A common combination: **MIT for the code** (`src/`, `tests/`, `scripts/`) and **CC BY 4.0 for the written content**
(`src/content/`, `docs/`). This is only a suggestion; pick what the owners want.

## Things to check before choosing

- **Who holds the copyright?** School policies often cover student work; ask the instructor.
- **Third-party material in the content.** The references and any photos in `public/` may have their own terms.
- **Dependencies** are all MIT-licensed (see `LICENSE`), so they don't restrict the choice.

## When decided

Replace `LICENSE` with the full license text (year and holder filled in), and update the *License* section of `README.md`.
