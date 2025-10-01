console.log("✅ index.js starting...");

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("✅ About to render App", { App });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



/*
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
*/