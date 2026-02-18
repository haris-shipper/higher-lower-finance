import { useState } from "react";
import Landing from "./Landing.jsx";
import Game from "./Game.jsx";

export default function App() {
  const [view, setView] = useState("landing");

  if (view === "finance") return <Game onBack={() => setView("landing")} />;
  return <Landing onPlay={(game) => setView(game)} />;
}
