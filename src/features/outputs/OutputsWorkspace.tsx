import { useMemo, useState, type FormEvent } from "react";
import { useCanon } from "../../data/store";

type Format = "newspaper" | "news";
type Voice = "alloy" | "nova" | "onyx";

export function OutputsWorkspace() {
  const { events } = useCanon();
  const [format, setFormat] = useState<Format>("newspaper");
  const [voice, setVoice] = useState<Voice>("nova");
  const [speaking, setSpeaking] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailQueued, setMailQueued] = useState(false);
  const lead = events[0];
  const narration = useMemo(
    () => format === "newspaper"
      ? `This is The Loredrop Daily. Today's banner story: ${lead.title}. Sources describe the mood as ${lead.mood}. In other news, ${events[1]?.title ?? "the group chat remains under investigation"}.`
      : `Breaking news. ${lead.title}. Sources close to the situation describe the mood as ${lead.mood}. When reached for comment, witnesses said: ${lead.quote}`,
    [format, lead, events],
  );

  async function narrate() {
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    try {
      const response = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: narration, voice }) });
      if (response.ok) {
        const audio = new Audio(URL.createObjectURL(await response.blob()));
        audio.onended = () => setSpeaking(false);
        await audio.play();
        return;
      }
    } catch { /* device voice fallback */ }
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = voice === "onyx" ? .86 : voice === "alloy" ? 1.08 : .96;
    utterance.pitch = voice === "nova" ? 1.18 : .92;
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
  }

  function requestMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMailQueued(true);
  }

  return (
    <section className="page-shell outputs-page">
      <header className="page-title output-heading">
        <div><span className="scribble">THE FUN PART</span><h1>Make the front page.</h1></div>
        <div className="format-switch">
          <button className={format === "newspaper" ? "active" : ""} onClick={() => setFormat("newspaper")}>The Daily</button>
          <button className={format === "news" ? "active" : ""} onClick={() => setFormat("news")}>Breaking News</button>
        </div>
      </header>

      <div className="output-stage">
        {format === "newspaper" ? <VintageNewspaper events={events}/> : <BreakingNews event={lead}/>}
        <aside className="output-controls">
          {format === "newspaper" && <div className="mail-card"><span>PRINT EDITION</span><h2>Send it to the doorstep.</h2><p>Turn today’s canon into a folded keepsake with ink, paper, and unreasonable journalistic confidence.</p><button onClick={() => { setMailOpen(true); setMailQueued(false); }} type="button">Mail me a copy</button><small>Hackathon fulfillment preview · address is not transmitted</small></div>}
          <div className="voice-box"><span className="live-dot">● LIVE-ish</span><h2>Give it a voice.</h2><p>Have your canon read by the exact wrong level of seriousness.</p><div className="voice-pills"><button className={voice === "nova" ? "active" : ""} onClick={() => setVoice("nova")}>Nova<br/><small>dramatic bestie</small></button><button className={voice === "alloy" ? "active" : ""} onClick={() => setVoice("alloy")}>Alloy<br/><small>radio chaos</small></button><button className={voice === "onyx" ? "active" : ""} onClick={() => setVoice("onyx")}>Onyx<br/><small>movie trailer</small></button></div><button className="listen-button" onClick={() => void narrate()}>{speaking ? "Stop the broadcast" : "Read this edition"}</button><small className="ai-note">AI voice when configured · device voice fallback</small></div>
        </aside>
      </div>

      {mailOpen && <div className="mail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMailOpen(false); }}><section aria-labelledby="mail-title" className="mail-dialog" role="dialog"><button aria-label="Close mailing form" className="mail-close" onClick={() => setMailOpen(false)}>×</button>{mailQueued ? <div className="mail-success"><span>THE PRESSES ARE WARMING UP</span><h2 id="mail-title">Your print request is queued.</h2><p>This MVP keeps the address on this screen and does not transmit it. Connect a print-and-mail provider to fulfill real copies.</p><button onClick={() => setMailOpen(false)}>Back to the front page</button></div> : <form onSubmit={requestMail}><span>PHYSICAL EDITION</span><h2 id="mail-title">Where should the paper land?</h2><label>Full name<input autoComplete="name" name="name" required/></label><label>Street address<input autoComplete="street-address" name="address" required/></label><div className="mail-row"><label>City<input autoComplete="address-level2" name="city" required/></label><label>State<input autoComplete="address-level1" name="state" required/></label><label>ZIP<input autoComplete="postal-code" inputMode="numeric" name="postal" required/></label></div><p>Your address stays in this demo form and is not sent or saved.</p><button className="mail-submit" type="submit">Reserve my print copy</button></form>}</section></div>}
    </section>
  );
}

function VintageNewspaper({ events }: { events: ReturnType<typeof useCanon>["events"] }) {
  const lead = events[0];
  const evidenceCount = lead.dropIds.length;
  return <article className="vintage-paper"><div className="paper-kicker"><span>THE FRIEND GROUP’S PAPER OF RECORD</span><span>PRICE: ONE GOOD STORY</span></div><header className="paper-masthead"><h2>The Loredrop Daily</h2><div><span>VOL. IV · NO. 07</span><b>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</b><span>TRUTH, MORE OR LESS</span></div></header><div className="paper-banner">EXTRA! EXTRA! GROUP CHAT ENTERS THE HISTORICAL RECORD</div><h3 className="paper-headline">{lead.title}</h3><p className="paper-deck">Witnesses describe the mood as “{lead.mood}” while the canon desk reviews {evidenceCount || "several"} {evidenceCount === 1 ? "piece" : "pieces"} of highly persuasive evidence.</p><div className="paper-byline">BY THE LOREDROP CANON DESK · SPECIAL TO THE GROUP CHAT</div><div className="paper-photo"><div className="halftone">LD</div><span>Artist’s reconstruction of the situation, because everyone was too busy to take a usable photo.</span></div><div className="paper-columns"><p><b className="drop-cap">S</b>ources close to the situation confirmed that {lead.title.toLowerCase()} has officially entered group lore. “{lead.quote}” one witness said, before requesting that the record show they looked incredible.</p><p>The timeline remains emotionally accurate, if not legally precise. Editors have preserved competing accounts wherever consensus would make the story less interesting.</p><section><h4>ELSEWHERE IN THE LORE</h4>{events.slice(1).map((event) => <div key={event.id}><b>{event.title}</b><span>{event.date} · {event.place}</span></div>)}</section></div><footer><span>WEATHER: 80% CHANCE OF ONE MORE PLACE</span><span>TEXT YOUR FRIENDS BACK</span></footer></article>;
}

function BreakingNews({ event }: { event: ReturnType<typeof useCanon>["events"][number] }) { return <article className="news-artifact"><div className="news-top"><b>LDRP 7</b><span>BREAKING NEWS</span><small>LIVE</small></div><div className="news-photo"><span>🚨</span><div className="news-grain"/></div><div className="news-copy"><span>DEVELOPING SITUATION</span><h2>{event.title}</h2><p>Sources close to the situation describe the mood as “{event.mood}.”</p></div><div className="lower-third"><b>BREAKING</b><span>“{event.quote}”</span></div><div className="ticker">● CANON DESK &nbsp; / &nbsp; GROUP CHAT DECLINES COMMENT &nbsp; / &nbsp; MORE AT 11</div></article>; }
