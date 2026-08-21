import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "./home-page";
import { RoomPage } from "./room-page";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/r/:slug" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
