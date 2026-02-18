import { useState, useEffect } from "react";
import Intro from "./Intro.jsx";
import Landing from "./Landing.jsx";
import Game from "./Game.jsx";
import Connections from "./Connections.jsx";
import Inbox from "./Inbox.jsx";
import Impostor from "./Impostor.jsx";
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

  function handleIntroComplete(name) {
    setUsername(name);
    setView("landing");
  }

  const sharedProps = { topPlayer, onLeaderboard: () => setView("leaderboard") };

  if (view === "intro")        return <Intro onComplete={handleIntroComplete} />;
  if (view === "finance")      return <Game        onBack={() => setView("landing")} username={username} {...sharedProps} />;
  if (view === "connections")  return <Connections onBack={() => setView("landing")} username={username} {...sharedProps} />;
  if (view === "inbox")        return <Inbox       onBack={() => setView("landing")} username={username} {...sharedProps} />;
  if (view === "impostor")     return <Impostor    onBack={() => setView("landing")} username={username} {...sharedProps} />;
  if (view === "leaderboard")  return <Leaderboard onBack={() => setView("landing")} username={username} topPlayer={topPlayer} />;
  return <Landing onPlay={(game) => setView(game)} username={username} />;
}
