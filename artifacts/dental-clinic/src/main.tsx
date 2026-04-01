import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// In production (Vercel), point API calls at the Render server.
// In dev, leave empty so the Vite proxy handles /api/* locally.
const apiUrl = import.meta.env.VITE_API_URL ?? "";
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
