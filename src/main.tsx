import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router";
import { CanvasWorkspace } from "./features/canvas/CanvasWorkspace";
import { DropWorkspace } from "./features/drop/DropWorkspace";
import { OutputsWorkspace } from "./features/outputs/OutputsWorkspace";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="top-island">
          <nav aria-label="Main navigation">
            <NavLink to="/drop">Drop</NavLink>
            <NavLink to="/canvas">Canvas</NavLink>
            <NavLink to="/outputs">Make stuff</NavLink>
            <NavLink to="/web">The web</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/drop" replace />} />
            <Route path="/drop" element={<DropWorkspace />} />
            <Route path="/canvas" element={<CanvasWorkspace />} />
            <Route path="/canon" element={<Navigate to="/canvas" replace />} />
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
