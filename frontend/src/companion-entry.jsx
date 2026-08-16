import React from "react";
import { createRoot } from "react-dom/client";
import CompanionWidget from "./components/companion/CompanionWidget";
import "./index.css"; // Tailwind (with prefix cw-)

const rootElement = document.getElementById("companion-root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<CompanionWidget />);
} else {
  console.warn("⚠️ Companion widget root element not found.");
}
