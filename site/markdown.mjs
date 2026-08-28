const blockStart = /^(?:#{1,3}\s|```|>\s?|[-*+]\s+|\d+\.\s+|---+$)/u;

export function renderMarkdown(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html = [];
  const headings = [];
  const usedAnchors = new Map();

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      html.push(
        `<div class="code-block"><div class="code-block__bar"><span>${escapeHtml(language || "text")}</span><button type="button" data-copy-code>Copy</button></div><pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre></div>`,
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/u.exec(line);
    if (heading) {
      const level = heading[1].length;
      const label = stripInlineMarkdown(heading[2]);
      const base = slug(label) || "section";
      const occurrence = usedAnchors.get(base) ?? 0;
      usedAnchors.set(base, occurrence + 1);
      const anchor = occurrence === 0 ? base : `${base}-${occurrence + 1}`;
      if (level >= 2) headings.push({ anchor, label, level });
      html.push(
        `<h${level} id="${anchor}">${inlineMarkdown(heading[2])}<a class="heading-anchor" href="#${anchor}" aria-label="Link to ${escapeHtml(label)}">#</a></h${level}>`,
      );
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index++].replace(/^>\s?/u, ""));
      }
      html.push(`<blockquote>${quote.map(value => inlineMarkdown(value)).join(" ")}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s+/u.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+/u.test(lines[index])) {
        items.push(lines[index++].replace(/^[-*+]\s+/u, ""));
      }
      html.push(`<ul>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/u.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/u.test(lines[index])) {
        items.push(lines[index++].replace(/^\d+\.\s+/u, ""));
      }
      html.push(`<ol>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && /^\s*\|?(?:\s*:?-+:?\s*\|)+/u.test(lines[index + 1])) {
      const header = tableCells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim())
        rows.push(tableCells(lines[index++]));
      html.push(
        `<div class="table-wrap"><table><thead><tr>${header.map(cell => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows
          .map(
            row =>
              `<tr>${header.map((_, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] ?? "")}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^---+$/u.test(line.trim())) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !blockStart.test(lines[index]) &&
      !(lines[index].includes("|") && index + 1 < lines.length && /^\s*\|?(?:\s*:?-+:?\s*\|)+/u.test(lines[index + 1]))
    ) {
      paragraph.push(lines[index++].trim());
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return {
    headings,
    html: html.join("\n"),
    text: stripInlineMarkdown(markdown.replace(/```[\s\S]*?```/gu, " "))
      .replace(/\s+/gu, " ")
      .trim(),
  };
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/u, "")
    .replace(/\|$/u, "")
    .split("|")
    .map(value => value.trim());
}

function inlineMarkdown(value) {
  const code = [];
  let output = escapeHtml(value).replace(/`([^`]+)`/gu, (_, contents) => {
    const token = `@@VIREO_CODE_${code.length}@@`;
    code.push(`<code>${contents}</code>`);
    return token;
  });
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/gu, (_, label, destination) => {
    const href = safeHref(destination);
    const external = /^https:\/\//u.test(href);
    return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
  });
  output = output.replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/gu, "<em>$1</em>");
  for (const [index, replacement] of code.entries()) output = output.replace(`@@VIREO_CODE_${index}@@`, replacement);
  return output;
}

function safeHref(value) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("https://") || href.startsWith("mailto:"))
    return href;
  return "#";
}

function stripInlineMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/gu, " ")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/^[-*+>]\s?/gmu, "")
    .replace(/^\d+\.\s+/gmu, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/[*_`|]/gu, "")
    .trim();
}

export function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
