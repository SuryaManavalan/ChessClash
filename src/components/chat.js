import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";

const Chat = ({ peer, conn }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        console.log('conn', conn);
        console.log('peer', peer);
        if (!conn) {
            console.warn("No active connection, redirecting to home.");
            navigate("/");
            return;
        }

        // Set up connection events
        conn.on("open", () => {
            console.log("Connection opened with", conn.peer);

            // Receive messages
            conn.on("data", (data) => {
                console.log("Received", data);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        user: conn.peer,
                        message: data,
                        time: new Date().toLocaleTimeString(),
                        self: false
                    }
                ]);
            });
        });

        // Handle peer disconnection
        conn.on("close", () => {
            console.log("Connection closed by peer");
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    user: "System",
                    message: "Peer has disconnected.",
                    time: new Date().toLocaleTimeString(),
                    self: false
                }
            ]);
        });

        // Clean up connection on component unmount
        return () => {
            if (conn) {
                conn.off("open");
                conn.off("data");
                conn.off("close");
                conn.close();
            }
        };
    }, [conn, navigate]);

    const handleSubmit = () => {
        if (message.trim() !== "") {
            // Send message
            conn.send(message);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    user: "You",
                    message: message,
                    time: new Date().toLocaleTimeString(),
                    self: true
                }
            ]);
            setMessage("");
        }
    };

    const handleHangUp = () => {
        if (conn) {
            conn.close();
            console.log("Connection closed by user");
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(),
                    user: "System",
                    message: "You have disconnected.",
                    time: new Date().toLocaleTimeString(),
                    self: true
                }
            ]);
            navigate("/");
        }
    };

    return (
        <div className="chat-container">
            <h1 className="chat-header">{peer.id}, you are chatting with {conn.peer}</h1>
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.self ? "self" : "other"}`}>
                        <p><strong>{msg.self ? "You" : msg.user}</strong> <span>({msg.time}):</span> {msg.message}</p>
                    </div>
                ))}
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="chat-input"
                    placeholder="Type a message..."
                />
                <button onClick={handleSubmit} className="chat-send-button">Send</button>
                <button onClick={handleHangUp} className="chat-hangup-button">Hang Up</button>
            </div>
        </div>
    );
};

export default Chat;
