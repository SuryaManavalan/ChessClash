import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NameInput from "./components/name-input";
import Dial from "./components/dial";
import Chat from "./components/chat";
import Chessboard from "./components/chessboard";

const App = () => {
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);

  // Create a ref to the Chessboard component
  const chessboardRef = useRef(null);

  // Function to handle button press and make a move
  const handleMove = () => {
    if (chessboardRef.current) {
      // Example move: move a piece from 'e2' to 'e4'
      chessboardRef.current.move('e2', 'e4');
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NameInput setPeer={setPeer} />} />
        <Route path="/dial" element={<Dial peer={peer} setConn={setConn} />} />
        <Route path="/chat" element={<Chat peer={peer} conn={conn} setConn={setConn} />} />
      </Routes>
    </BrowserRouter>
    // <div>
    //   <Chessboard ref={chessboardRef} color="white" />

    //   <button onClick={handleMove}>Make Move e2 to e4</button>
    // </div>
  );
};

export default App;
