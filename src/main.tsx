import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router";
import { CanvasWorkspace } from "./features/canvas/CanvasWorkspace";
import { DropWorkspace } from "./features/drop/DropWorkspace";
import { OutputsWorkspace } from "./features/outputs/OutputsWorkspace";
import { WebWorkspace } from "./features/web/WebWorkspace";
import "./styles.css";
import "./web.css";
import "./layout.css";
import "./composer.css";
import "./fullscreen.css";
import "./case-file.css";
import "./board.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <BrowserRouter>
      <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <aside className="sidebar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Hide sidebar" type="button">‹</button>
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              L
            </span>
            <span>Loredrop</span>
          </div>
          <p className="brand-tagline">your group chat,<br/>but make it tea ✦</p>
          <nav aria-label="Main navigation">
            <NavLink to="/drop"><span aria-hidden="true">↘</span> Drop</NavLink>
            <NavLink to="/canvas"><span aria-hidden="true">✓</span> Case File</NavLink>
            <NavLink to="/web"><span aria-hidden="true">⌘</span> Evidence Board</NavLink>
            <NavLink to="/outputs"><span aria-hidden="true">✦</span> Share</NavLink>
          </nav>
        </aside>
        {!sidebarOpen && <button className="sidebar-restore" onClick={() => setSidebarOpen(true)} title="Show sidebar" type="button">›</button>}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/drop" replace />} />
            <Route path="/drop" element={<DropWorkspace />} />
            <Route path="/canvas" element={<CanvasWorkspace />} />
            <Route path="/canon" element={<Navigate to="/canvas" replace />} />
            <Route path="/outputs" element={<OutputsWorkspace />} />
            <Route path="/web" element={<WebWorkspace />} />
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
