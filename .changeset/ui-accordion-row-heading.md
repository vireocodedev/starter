---
"@vireocodedev/starter-ui": minor
---

`MobileTableAccordionRow`'s row `Accordion` no longer wraps its summary title
in an implicit `<h3>` (MUI's default `Accordion` heading slot). Mobile table
rows render their title in a plain `<div>` via `slots={{ heading: "div" }}`,
avoiding spurious headings in server-table mobile list views.
