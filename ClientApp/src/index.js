import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/styles.css";
import '../node_modules/leaflet/dist/leaflet.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';


import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
