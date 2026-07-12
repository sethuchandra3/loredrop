import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router";
import { GenerationWorkspace } from "./features/generation/GenerationWorkspace";
import { ListWorkspace } from "./features/list/ListWorkspace";
import { CanvasWorkspace } from "./features/canvas/CanvasWorkspace";
import { StudioWorkspace } from "./features/studio/StudioWorkspace";
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
          <p className="brand-tagline">A living atlas for imagined worlds.</p>
          <nav aria-label="Main navigation">
            <NavLink to="/list"><span aria-hidden="true">◫</span> Lore</NavLink>
            <NavLink to="/canvas"><span aria-hidden="true">⌘</span> Canvas</NavLink>
            <NavLink to="/generate"><span aria-hidden="true">✦</span> Generate</NavLink>
            <NavLink to="/studio"><span aria-hidden="true">✎</span> Studio</NavLink>
          </nav>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="/list" element={<ListWorkspace />} />
            <Route path="/canvas" element={<CanvasWorkspace />} />
            <Route path="/studio" element={<StudioWorkspace />} />
            <Route path="/generate" element={<GenerationWorkspace />} />
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
