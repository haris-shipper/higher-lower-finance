import { useState, useEffect } from "react";
import Intro from "./Intro.jsx";
import Landing from "./Landing.jsx";
import Game from "./Game.jsx";
import Connections from "./Connections.jsx";
import Inbox from "./Inbox.jsx";
import Impostor from "./Impostor.jsx";
import Dossier from "./Dossier.jsx";
import Leaderboard from "./Leaderboard.jsx";
import { fetchAllScores, topOverallPlayer } from "./supabase.js";

const storedUser = localStorage.getItem("qlg_username") || "";

export default function App() {
  const [view,      setView]      = useState(storedUser ? "landing" : "intro");
  const [username,  setUsername]  = useState(storedUser);
  const [topPlayer, setTopPlayer] = useState(null);

  useEffect(() => {
    fetchAllScores().then(scores => setTopPlayer(topOverallPlayer(scores)));
  }, []);

  // Stamp the initial view into history so popstate always has a state object
  useEffect(() => {
    window.history.replaceState({ view }, "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back button / mobile swipe-back / trackpad swipe
  useEffect(() => {
    const onPop = (e) => {
      const v = e.state?.view;
      if (v) setView(v);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Backspace key → browser back (skip when typing in an input)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Backspace") return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      window.history.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Navigate forward — push a real history entry
  function navigate(newView) {
    window.history.pushState({ view: newView }, "");
    setView(newView);
  }

  function handleIntroComplete(name) {
    setUsername(name);
    navigate("landing");
  }

  const sharedProps = { topPlayer, onLeaderboard: () => navigate("leaderboard") };
  const goLanding   = () => navigate("landing");

  if (view === "intro")        return <Intro onComplete={handleIntroComplete} />;
  if (view === "finance")      return <Game        onBack={goLanding} username={username} {...sharedProps} />;
  if (view === "connections")  return <Connections onBack={goLanding} username={username} {...sharedProps} />;
  if (view === "inbox")        return <Inbox       onBack={goLanding} username={username} {...sharedProps} />;
  if (view === "impostor")     return <Impostor    onBack={goLanding} username={username} {...sharedProps} />;
  if (view === "dossier")      return <Dossier     onBack={goLanding} username={username} {...sharedProps} />;
  if (view === "leaderboard")  return <Leaderboard onBack={goLanding} username={username} topPlayer={topPlayer} />;
  return <Landing onPlay={(game) => navigate(game)} username={username} />;
}
