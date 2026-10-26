"use client";
import { useEffect, useRef, useState } from "react";
import { toEntry, toMarkdown } from "../lib/format.mjs";

const KEY = "voicelog.entries.v1";
const SAMPLE = "Okay so um yesterday I fixed the the login redirect bug and merged the PR. Then I uh basically wrote the docs for the webhook. Today I'm going to add rate limiting to the API and you know write tests for it. I'm blocked on the staging database, waiting on access from ops. #backend #api";

export default function Home() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState("");
  const rec = useRef(null);

  useEffect(() => { try { setEntries(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} }, []);
  const save = (list) => { setEntries(list); localStorage.setItem(KEY, JSON.stringify(list)); };

  const preview = text.trim() ? toEntry(text) : null;

  function mic() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { alert("No Web Speech API in this browser. Use Wispr Flow: hold your hotkey and talk into the box."); return; }
    if (listening) { rec.current?.stop(); return; }
    const r = new SR(); r.continuous = true; r.interimResults = false; r.lang = "en-IN";
    r.onresult = (e) => { let s = ""; for (let i = e.resultIndex; i < e.results.length; i++) s += e.results[i][0].transcript + " "; setText((t) => (t + " " + s).trim()); };
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  }

  function add() { if (!preview) return; save([preview, ...entries]); setText(""); }
  function del(id) { save(entries.filter((e) => e.id !== id)); }
  async function copy(e) { await navigator.clipboard?.writeText(toMarkdown(e)).catch(() => {}); setCopied(e.id); setTimeout(() => setCopied(""), 1500); }
  function exportAll() {
    const blob = new Blob([entries.map(toMarkdown).join("\n\n")], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "voicelog.md"; a.click();
  }

  const ql = q.trim().toLowerCase();
  const shown = entries.filter((e) => !ql || e.raw.toLowerCase().includes(ql) || e.tags.some((t) => t.includes(ql.replace("#", ""))));

  return (
    <main>
      <header>
        <h1>VoiceLog</h1>
        <p>Talk your standup. Get a clean dev log. Click the box, hold your Wispr Flow key and ramble.</p>
      </header>

      <section className="card">
        <textarea id="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you do yesterday, what's next, what's blocking you? Say it like you'd say it to a teammate." rows={6} />
        <div className="row">
          <button onClick={mic} className={listening ? "rec" : ""}>{listening ? "Stop mic" : "Browser mic"}</button>
          <button onClick={() => setText(SAMPLE)} className="ghost">Try sample ramble</button>
          <span className="grow" />
          <button onClick={add} disabled={!preview} className="primary">Save entry</button>
        </div>
      </section>

      {preview && (
        <section className="card preview">
          <h2>Preview</h2>
          <Entry e={preview} />
        </section>
      )}

      <section>
        <div className="row">
          <h2 className="grow">Timeline ({entries.length})</h2>
          <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search text or #tag" />
          <button className="ghost" onClick={exportAll} disabled={!entries.length}>Export .md</button>
        </div>
        {shown.map((e) => (
          <article key={e.id} className="card">
            <div className="row meta">
              <span className="grow">{new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              <button className="ghost" onClick={() => copy(e)}>{copied === e.id ? "Copied" : "Copy standup"}</button>
              <button className="ghost" onClick={() => del(e.id)}>Delete</button>
            </div>
            <Entry e={e} />
          </article>
        ))}
        {!shown.length && <p className="muted">{entries.length ? "Nothing matches." : "No entries yet. Everything stays in this browser."}</p>}
      </section>
      <footer className="muted">Stored in localStorage. No account, no server, no paid API. <a href="https://github.com/amantebriwal4321/voicelog">Source</a></footer>
    </main>
  );
}

function Entry({ e }) {
  const S = ({ k, h }) => (e.parts[k].length || k === "blockers") ? (
    <div className={"sec " + k}><h3>{h}</h3><ul>{(e.parts[k].length ? e.parts[k] : ["None"]).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
  ) : null;
  return (
    <div className="entry">
      <div className="grid"><S k="yesterday" h="Yesterday" /><S k="today" h="Today" /><S k="blockers" h="Blockers" /><S k="notes" h="Notes" /></div>
      {e.tags.length > 0 && <div className="tags">{e.tags.map((t) => <span key={t}>#{t}</span>)}</div>}
    </div>
  );
}
