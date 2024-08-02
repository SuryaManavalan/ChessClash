import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dial.css";

const Dial = ({ peer, conn, setConn }) => {
    const [peerName, setPeerName] = useState("");
    const [localConn, setLocalConn] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (peer) {
            peer.on("connection", (incomingConn) => {
                console.log("Received incoming connection:", incomingConn);
                setConn(incomingConn);
                navigate("/chat");
            });

            // Cleanup event listener on component unmount
            return () => {
                peer.off("connection");
            };
        }
    }, [peer, setConn, navigate]);

    useEffect(() => {
        console.log("Connection established:", localConn);
        if (localConn) {
            localConn.on("open", () => {
                console.log("Connected to peer:", peerName);
                setConn(localConn);
                navigate("/chat");
            });
        }
    }, [localConn]);

    const handleSubmit = () => {
        const connection = peer.connect(peerName);

        setLocalConn(connection);
    };

    return (
        <div className="dial-container">
            <h1 className="dial-header">Who do you want to chat with?</h1>
            <input
                type="text"
                value={peerName}
                onChange={(e) => setPeerName(e.target.value)}
                className="dial-input"
                placeholder="Enter peer name..."
            />
            <button onClick={handleSubmit} className="dial-submit-button">Submit</button>
        </div>
    );
};

export default Dial;
