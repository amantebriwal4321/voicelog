// Rule based cleanup. No model, no network. It only rearranges what you said.
const FILLERS = [
  /\b(?:um+|uh+|erm+|hmm+)\b[,.]?/gi,
  /\byou know\b,?/gi,
  /\bi mean\b,?/gi,
  /\bkind of\b|\bsort of\b/gi,
  /\bbasically\b,?/gi,
  /\bactually\b,?/gi,
  /\bso yeah\b[,.]?/gi,
  /([,.]\s*)like,\s*/gi,
];

const RULES = {
  blockers: /\b(blocked|blocker|stuck|waiting (on|for)|can'?t|cannot|failing|fails|broken|issue with|problem with|no access)\b/i,
  today: /\b(today|going to|gonna|will|plan to|next up|now i'?m|working on|i'?ll)\b/i,
  yesterday: /\b(yesterday|last night|finished|completed|shipped|fixed|merged|deployed|did|wrapped up|closed|wrote|built|added|updated|reviewed|tested|refactored)\b/i,
};

export function clean(text) {
  let t = ` ${text} `;
  for (const r of FILLERS) t = t.replace(r, (m, p1) => (typeof p1 === "string" ? p1 + " " : " "));
  t = t.replace(/\b(\w+)( \1\b)+/gi, "$1"); // "the the" -> "the"
  t = t.replace(/\s+([,.!?])/g, "$1").replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
  return t;
}

export function sentences(text) {
  return clean(text)
    .split(/(?<=[.!?])\s+|\s+(?:and then|then|also|after that)\s+/i)
    .map((s) => s.replace(/^[,\s]+|[,\s]+$/g, "").replace(/^((and|so|but|okay|ok|then|right|alright),?\s+)+/i, ""))
    .filter((s) => s.split(" ").length >= 2)
    .map((s) => {
      s = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?]$/.test(s) ? s : s + ".";
    });
}

export function bucket(s) {
  if (RULES.blockers.test(s)) return "blockers";
  if (RULES.yesterday.test(s)) return "yesterday";
  if (RULES.today.test(s)) return "today";
  return "notes";
}

export function tags(text) {
  const out = new Set();
  for (const m of text.matchAll(/#([a-z0-9_-]+)/gi)) out.add(m[1].toLowerCase());
  for (const m of text.matchAll(/\bhashtag ([a-z0-9_-]+)/gi)) out.add(m[1].toLowerCase());
  return [...out];
}

export function toEntry(raw, date = new Date()) {
  const parts = { yesterday: [], today: [], blockers: [], notes: [] };
  const body = raw.replace(/\bhashtag \w+/gi, "").replace(/#\w+/g, "");
  for (const s of sentences(body)) parts[bucket(s)].push(s);
  return { id: date.getTime().toString(36), at: date.toISOString(), raw, parts, tags: tags(raw) };
}

export function toMarkdown(e) {
  const d = new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const sec = (h, a) => (a.length ? `**${h}**\n${a.map((x) => `- ${x}`).join("\n")}\n` : "");
  return [
    `### Standup, ${d}`,
    sec("Yesterday", e.parts.yesterday),
    sec("Today", e.parts.today),
    sec("Blockers", e.parts.blockers.length ? e.parts.blockers : ["None"]),
    sec("Notes", e.parts.notes),
    e.tags.length ? e.tags.map((t) => `#${t}`).join(" ") : "",
  ].filter(Boolean).join("\n");
}
