"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Session = { embed_url: string; session_id?: string };

export default function Home() {
  const hostRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const hbRef = useRef<any>(null);
  const [address, setAddress] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardHint, setKeyboardHint] = useState(false);
  const [connected, setConnected] = useState(false);

  const startBrowser = useCallback(async () => {
    if (!hostRef.current || hbRef.current || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start the cloud browser.");
      const module = await import("@hyperbeam/web");
      const Hyperbeam = (module as any).default ?? module;
      hbRef.current = await Hyperbeam(hostRef.current, data.embed_url, {
        adminToken: data.admin_token
      });
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the cloud browser.");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    void startBrowser();
    return () => {
      try { hbRef.current?.destroy?.(); } catch {}
      hbRef.current = null;
    };
  }, []); // Start one remote session when the page loads.

  const navigate = async (event: FormEvent) => {
    event.preventDefault();
    const raw = address.trim();
    if (!raw) return;
    const normalized = /^(https?:\/\/|about:)/i.test(raw)
      ? raw
      : (raw.includes(".") && !raw.includes(" ") ? `https://${raw}` : `https://www.google.com/search?q=${encodeURIComponent(raw)}`);
    setAddress(normalized);
    try {
      if (!hbRef.current) {
        setError("The cloud browser is not connected yet. Try reconnecting.");
        return;
      }
      await hbRef.current.tabs.update({ url: normalized });
      addressRef.current?.blur();
      setKeyboardHint(false);
    } catch {
      setError("Navigation failed. Try again.");
    }
  };

  const openKeyboard = () => {
    // Browsers only reliably open the native keyboard after a user gesture.
    addressRef.current?.focus();
    setKeyboardHint(true);
  };

  const toggleFullscreen = async () => {
    const element = hostRef.current;
    try {
      if (!document.fullscreenElement) await element?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      setError("Fullscreen is not available in this browser. You can still use the page in standalone mode.");
    }
  };

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brand"><span className="brandMark">◉</span><span>CloudBrowser</span><span className="badge">BETA</span></div>
        <button className="iconButton" aria-label="Fullscreen" onClick={toggleFullscreen} title="Fullscreen">⛶</button>
      </header>

      <form className="addressBar" onSubmit={navigate}>
        <span className="lockIcon" aria-hidden="true">⌁</span>
        <input
          ref={addressRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onFocus={() => setKeyboardHint(false)}
          placeholder="Search or enter website"
          aria-label="Search or enter website"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className="goButton" type="submit">Go</button>
      </form>

      <nav className="toolbar" aria-label="Browser controls">
        <button onClick={() => { void hbRef.current?.tabs?.goBack?.(); }} title="Back" aria-label="Back">‹</button>
        <button onClick={() => { void hbRef.current?.tabs?.goForward?.(); }} title="Forward" aria-label="Forward">›</button>
        <button onClick={() => { setConnected(false); hbRef.current?.destroy?.(); hbRef.current = null; void startBrowser(); }} title="Reconnect" aria-label="Reconnect">↻</button>
        <div className="toolbarSpacer" />
        <button className="keyboardButton" onClick={openKeyboard} title="Open keyboard" aria-label="Open keyboard">⌨ <span>Keyboard</span></button>
      </nav>

      <section className="browserStage" aria-label="Remote browser">
        <div className="browserStatus">
          <span className={`statusDot ${connected ? "online" : ""}`} />
          {loading ? "Starting secure cloud session…" : connected ? "Cloud session connected" : "Connecting to Hyperbeam…"}
        </div>
        <div ref={hostRef} className="browserViewport" />
        {!connected && !loading && error && (
          <div className="errorCard">
            <div className="errorIcon">!</div>
            <h2>Browser unavailable</h2>
            <p>{error}</p>
            <button className="primaryButton" onClick={() => { setError(""); void startBrowser(); }}>Try again</button>
          </div>
        )}
        {loading && <div className="loadingCard"><div className="spinner" /><p>Waking up your cloud browser</p><span>This can take a few seconds.</span></div>}
      </section>

      <footer className="bottomBar">
        <span><i className={`statusDot ${connected ? "online" : ""}`} /> {connected ? "Connected" : "Not connected"}</span>
        <span>Remote browsing by Hyperbeam</span>
      </footer>

      {keyboardHint && <div className="keyboardHint" role="status">Type a website or search, then tap <b>Go</b>. The device controls when its keyboard appears.</div>}
      {error && (connected || loading) && <div className="toast" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss">×</button></div>}
    </main>
  );
}
