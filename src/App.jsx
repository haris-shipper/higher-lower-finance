import { useState } from "react";
import Landing from "./Landing.jsx";
import Game from "./Game.jsx";
import Connections from "./Connections.jsx";
import Inbox from "./Inbox.jsx";
import Impostor from "./Impostor.jsx";

export default function App() {
  const [view, setView] = useState("landing");

  if (view === "finance") return <Game onBack={() => setView("landing")} />;
  if (view === "connections") return <Connections onBack={() => setView("landing")} />;
  if (view === "inbox") return <Inbox onBack={() => setView("landing")} />;
  if (view === "impostor") return <Impostor onBack={() => setView("landing")} />;
  return <Landing onPlay={(game) => setView(game)} />;
}
