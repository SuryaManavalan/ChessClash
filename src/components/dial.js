import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dial.css";

const Dial = ({ peer, conn, setConn }) => {
    const [peerName, setPeerName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (peer) {
            peer.on("connection", (incomingConn) => {
                console.log("Received incoming connection:", incomingConn);
                setConn(incomingConn);
                navigate("/chat");
            });

            // Cleanup event listener on component unmount
            // return () => {
            //     peer.off("connection");
            // };
        }
    }, [peer, setConn, navigate]);

    const handleSubmit = () => {
        const submitButton = document.getElementsByClassName('dial-submit-button')[0];
        if (submitButton) {
            // make submit button disappear
            submitButton.disabled = true;
            submitButton.innerText = "Connecting...";
        } else {
            console.error("Submit button not found");
            return;
        }

        // navigate to chat page with the peer name as a URL parameter
        navigate(`/chat?peer=${peerName}`);
    };

    return (
        <div className="dial-container">
            <h1 className="dial-header">Who do you want to chat with?</h1>
            <input
                type="text"
                value={peerName}
                onChange={(e) => setPeerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="dial-input"
                placeholder="Enter peer name..."
            />
            <button onClick={handleSubmit} className="dial-submit-button">Submit</button>
        </div>
    );
};

export default Dial;
