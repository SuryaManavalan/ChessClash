import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NameInput from "./components/name-input";
import Dial from "./components/dial";
import Chat from "./components/chat";

const App = () => {
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NameInput setPeer={setPeer} />} />
        <Route path="/dial" element={<Dial peer={peer} setConn={setConn} />} />
        <Route path="/chat" element={<Chat peer={peer} conn={conn} setConn={setConn} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
