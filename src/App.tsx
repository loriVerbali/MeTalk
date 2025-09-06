import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "./state/useAppStore";
import { initSession } from "./lib/session";
import DisclaimerBanner from "./components/DisclaimerBanner";
import Upload from "./routes/Upload";
// AvatarReview route removed - now using direct feeling image generation
import Board from "./routes/Board";
import PrintPreview from "./routes/PrintPreview";
import "./styles/globals.css";

function App() {
  try {
    const { highContrast } = useAppStore();

    useEffect(() => {
      // Initialize session
      initSession();

      // Apply high contrast mode if enabled
      document.documentElement.setAttribute(
        "data-high-contrast",
        highContrast.toString()
      );
    }, [highContrast]);

    return (
      <Router>
        <div className="App">
          <DisclaimerBanner />
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/board" element={<Board />} />
            <Route path="/print" element={<PrintPreview />} />
          </Routes>
        </div>
      </Router>
    );
  } catch (error) {
    console.error("App error:", error);
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Error Loading App</h1>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        <pre>{error instanceof Error ? error.stack : "No stack trace"}</pre>
      </div>
    );
  }
}

export default App;
