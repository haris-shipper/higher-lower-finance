import { useState } from "react";
import Intro from "./Intro.jsx";
import Landing from "./Landing.jsx";
import Game from "./Game.jsx";
import Connections from "./Connections.jsx";
import Inbox from "./Inbox.jsx";
import Impostor from "./Impostor.jsx";
import Leaderboard from "./Leaderboard.jsx";

const storedUser = localStorage.getItem("qlg_username") || "";

export default function App() {
  const [view,     setView]     = useState(storedUser ? "landing" : "intro");
  const [username, setUsername] = useState(storedUser);

  function handleIntroComplete(name) {
    setUsername(name);
    setView("landing");
  }

  if (view === "intro")        return <Intro onComplete={handleIntroComplete} />;
  if (view === "finance")      return <Game        onBack={() => setView("landing")} username={username} />;
  if (view === "connections")  return <Connections onBack={() => setView("landing")} username={username} />;
  if (view === "inbox")        return <Inbox       onBack={() => setView("landing")} username={username} />;
  if (view === "impostor")     return <Impostor    onBack={() => setView("landing")} username={username} />;
  if (view === "leaderboard")  return <Leaderboard onBack={() => setView("landing")} username={username} />;
  return <Landing onPlay={(game) => setView(game)} username={username} />;
}
