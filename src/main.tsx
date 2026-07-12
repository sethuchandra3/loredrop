import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router";
import { GenerationWorkspace } from "./features/generation/GenerationWorkspace";
import "./styles.css";

function ListRoute() {
  return (
    <section className="route-panel">
      <p className="eyebrow">List</p>
      <h1>List workspace</h1>
      <p>Track lore drops, saved ideas, and lightweight reference notes.</p>
    </section>
  );
}

function CanvasRoute() {
  return (
    <section className="route-panel">
      <p className="eyebrow">Canvas</p>
      <h1>Canvas workspace</h1>
      <p>Map relationships, scenes, and concepts in a visual planning surface.</p>
    </section>
  );
}

function StudioRoute() {
  return (
    <section className="route-panel">
      <p className="eyebrow">Studio</p>
      <h1>Studio workspace</h1>
      <p>Shape drafts, polish details, and prepare finished material.</p>
    </section>
  );
}

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
          <nav aria-label="Main navigation">
            <NavLink to="/list">List</NavLink>
            <NavLink to="/canvas">Canvas</NavLink>
            <NavLink to="/studio">Studio</NavLink>
            <NavLink to="/generate">Generate</NavLink>
          </nav>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="/list" element={<ListRoute />} />
            <Route path="/canvas" element={<CanvasRoute />} />
            <Route path="/studio" element={<StudioRoute />} />
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
