import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import '../assets/chessground.base.css';
import '../assets/chessground.brown.css';
import '../assets/chessground.cburnett.css';
import './chessboard.css';
import { playPredrop } from 'chessground/board';

const Chessboard = forwardRef(({ color = 'white', handleMove, sendPlayAgain }, ref) => {
    const boardRef = useRef(null);
    const chessgroundInstance = useRef(null);
    const chessInstance = useRef(new Chess());
    const [fen, setFen] = useState(chessInstance.current.fen());
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        if (boardRef.current) {
            const turnColor = chessInstance.current.turn() === 'w' ? 'white' : 'black';
            chessgroundInstance.current = Chessground(boardRef.current, {
                draggable: {
                    enabled: true,
                },
                movable: {
                    color: color,
                },
                fen: fen,
                turnColor: turnColor,
                orientation: color, // Set the orientation based on the player's color
                events: {
                    move: (orig, dest) => {
                        try {
                            const move = chessInstance.current.move({ from: orig, to: dest });
                            console.log(`Moved from ${orig} to ${dest}`);
                            setFen(chessInstance.current.fen());
                            handleMove(orig, dest);

                            // Check if the game is over
                            if (chessInstance.current.isGameOver()) {
                                setGameOver(true);
                                if (chessInstance.current.isCheckmate()) {
                                    setWinner(turnColor === 'white' ? 'black' : 'white');
                                } else {
                                    setWinner('draw');
                                }
                            }
                        } catch (e) {
                            console.log('Illegal move', e);
                            chessgroundInstance.current.set({ fen: chessInstance.current.fen() }); // Reset to the last valid position
                        }
                    },
                },
            });
        }

        return () => {
            if (chessgroundInstance.current) {
                chessgroundInstance.current.destroy();
            }
        };
    }, [fen, color]);

    // Expose the move function via ref
    useImperativeHandle(ref, () => ({
        move: (from, to) => {
            try {
                const move = chessInstance.current.move({ from, to });
                if (move) {
                    setFen(chessInstance.current.fen());
                    chessgroundInstance.current.set({ fen: chessInstance.current.fen() });
                    console.log(`Opponent moved from ${from} to ${to}`);

                    // Check if the game is over
                    if (chessInstance.current.isGameOver()) {
                        setGameOver(true);
                        if (chessInstance.current.isCheckmate()) {
                            setWinner(chessInstance.current.turn() === 'w' ? 'black' : 'white');
                        } else {
                            setWinner('draw');
                        }
                    }
                } else {
                    console.log('Illegal move');
                }
            } catch (e) {
                console.log('Error making opponent move:', e);
            }
        },
        playAgain: () => {
            handlePlayAgain();
        }
    }));

    const handlePlayAgain = () => {
        chessInstance.current.reset();
        setFen(chessInstance.current.fen());
        setGameOver(false);
        setWinner(null);
        chessgroundInstance.current.set({ fen: chessInstance.current.fen() });
    };

    return (
        <div>
            {!gameOver && <div ref={boardRef} style={{ width: '350px', height: '350px' }} />}
            {gameOver && (
                <div>
                    <h3>
                        {winner === 'draw'
                            ? "It's a draw!"
                            : `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`}
                    </h3>
                    <button className='play-again-button' onClick={() => {
                        handlePlayAgain();
                        sendPlayAgain();
                    }}>Play Again</button>
                </div>
            )}
        </div>
    );
});

export default Chessboard;
