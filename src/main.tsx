// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Add Plausible Analytics
const script = document.createElement("script");
script.defer = true;
script.dataset.domain = "metalk-demo.local"; // Change this to your actual domain
script.src = "https://plausible.io/js/script.js";
document.head.appendChild(script);

createRoot(document.getElementById("root")!).render(<App />);
