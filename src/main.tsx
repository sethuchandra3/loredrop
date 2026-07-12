import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router";
import { CanvasWorkspace } from "./features/canvas/CanvasWorkspace";
import { DropWorkspace } from "./features/drop/DropWorkspace";
import { CanonWorkspace } from "./features/canon/CanonWorkspace";
import { OutputsWorkspace } from "./features/outputs/OutputsWorkspace";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              L
            </span>
            <span>Loredrop</span>
          </div>
          <p className="brand-tagline">your group chat,<br/>but make it canon ✦</p>
          <nav aria-label="Main navigation">
            <NavLink to="/drop"><span aria-hidden="true">↘</span> Drop</NavLink>
            <NavLink to="/canon"><span aria-hidden="true">✓</span> Canon</NavLink>
            <NavLink to="/outputs"><span aria-hidden="true">✦</span> Make stuff</NavLink>
            <NavLink to="/web"><span aria-hidden="true">⌘</span> The web</NavLink>
          </nav>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/drop" replace />} />
            <Route path="/drop" element={<DropWorkspace />} />
            <Route path="/canon" element={<CanonWorkspace />} />
            <Route path="/outputs" element={<OutputsWorkspace />} />
            <Route path="/web" element={<CanvasWorkspace />} />
            <Route path="*" element={<Navigate to="/drop" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
