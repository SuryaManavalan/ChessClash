import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import "./name-input.css";

const NameInput = ({ setPeer }) => {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        console.log("Setting up peer connection...");
        const peer = new Peer(name);

        peer.on("open", (id) => {
            console.log("Peer connection opened with ID:", id);
            setPeer(peer); // Store the peer instance in the state of the parent component
            navigate("/dial");
        });

        peer.on("error", (err) => {
            console.error("Peer connection error:", err);
        });
    };

    return (
        <div className="name-input-container">
            <h1 className="name-input-header">What's your name?</h1>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
                placeholder="Enter your name..."
            />
            <button onClick={handleSubmit} className="name-submit-button">Submit</button>
        </div>
    );
};

export default NameInput;
