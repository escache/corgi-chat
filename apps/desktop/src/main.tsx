import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlatformProvider, setApiBaseUrl } from "@corgi-chat/core";
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { App } from "./App";
import { createTauriPlatform } from "./platform";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
    },
  },
});

const platform = createTauriPlatform();

// API base URL is provided by Vite env at build/runtime; fallback to the public web app.
setApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PlatformProvider platform={platform}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PlatformProvider>
  </React.StrictMode>,
);
