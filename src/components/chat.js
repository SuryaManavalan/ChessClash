import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";
import Chessboard from "./chessboard";
import { move } from "chessground/drag";

const Chat = ({ peer, conn, setConn }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const chessboardRef = useRef(null);
    const [color, setColor] = useState('white');

    useEffect(() => {
        const type = new URLSearchParams(window.location.search).get("type");
        if (type === "incoming") {
            setColor('black');
        } else {
            setColor('white');
        }

        console.log("Connection:", conn);

        if (!conn) {
            const peerId = new URLSearchParams(window.location.search).get("peer");
            const connection = peer.connect(peerId.trim());
            console.log("Connection established:", connection);
            if (connection) {
                connection.on("open", () => {
                    console.log("Connected to peer:", connection.peer);
                    setConn(connection);

                    // Receive messages (connector peer)
                    connection.on("data", (data) => {

                        if (data.startsWith('<chess>')) {
                            const move = data.substring(7);
                            console.log(`Received move: ${move}`);
                            const [from, to] = [move.substring(0, 2), move.substring(2, 4)];
                            console.log(`Moving from ${from} to ${to}`);
                            if (chessboardRef.current) {
                                chessboardRef.current.move(from, to);
                            }
                            return;
                        }
                        else if (data === "<playagain>") {
                            console.log("Received play again request");
                            if (chessboardRef.current) {
                                chessboardRef.current.playAgain();
                            }
                        } else {
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
                        }
                    });
                });

                connection.on("close", () => {
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
            }
            return;
        }

        // Set up connection events
        conn.on("open", () => {
            console.log("Connection opened with", conn.peer);

            // Receive messages (connected-to peer)
            conn.on("data", (data) => {
                // check if the message is a move (has prefix '<chess>' ex. '<chess>e2e4')
                if (data.startsWith('<chess>')) {
                    const move = data.substring(7);
                    console.log(`Received move: ${move}`);
                    const [from, to] = [move.substring(0, 2), move.substring(2, 4)];
                    console.log(`Moving from ${from} to ${to}`);
                    if (chessboardRef.current) {
                        chessboardRef.current.move(from, to);
                    }
                    return;
                }
                else if (data === "<playagain>") {
                    console.log("Received play again request");
                    if (chessboardRef.current) {
                        chessboardRef.current.playAgain();
                    }
                } else {
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
                }
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

    const handleMove = (from, to) => {
        const move = `<chess>${from}${to}`;
        console.log(`Sending move: ${move}`);
        conn.send(move);
    };

    const sendPlayAgain = () => {
        // if (conn) {
            console.log("Sending play again request");
            conn.send("<playagain>");
        // }
    }

    return (
        <div className="chat-container">
            <h1 className="chat-header">{peer ? peer.id : 'User'}, you are playing against {conn ? conn.peer : 'Unknown'}</h1>
            {conn && (
                <div className="chat-chessboard">
                    <Chessboard ref={chessboardRef} color={color} handleMove={handleMove} sendPlayAgain={sendPlayAgain} />
                </div>
            )}
            <button onClick={handleHangUp} className="chat-hangup-button">Hang Up</button>
            {/* <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.self ? "self" : "other"}`}>
                        <p><strong>{msg.self ? "You" : msg.user}: </strong> {msg.message}</p>
                        <span className="timestamp">{msg.time}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="chat-input"
                    placeholder="Type a message..."
                />
                <button onClick={handleSubmit} className="chat-send-button">Send</button>
                <button onClick={handleHangUp} className="chat-hangup-button">Hang Up</button>
            </div> */}
        </div>
    );
};

export default Chat;
