import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import '../assets/chessground.base.css';
import '../assets/chessground.brown.css';
import '../assets/chessground.cburnett.css';

const Chessboard = () => {
    const boardRef = useRef(null);
    const chessgroundInstance = useRef(null);
    const chessInstance = useRef(new Chess()); // Initialize a new Chess instance
    const [fen, setFen] = useState(chessInstance.current.fen()); // Track the current FEN

    useEffect(() => {
        if (boardRef.current) {
            chessgroundInstance.current = Chessground(boardRef.current, {
                draggable: {
                    enabled: true,
                },
                movable: {
                    // free: false, // Disable free move to rely on chess.js validation
                },
                fen: fen, // Use the current FEN
                orientation: 'white',
                events: {
                    move: (orig, dest) => {
                        try{
                        const move = chessInstance.current.move({ from: orig, to: dest });
                            console.log(`Moved from ${orig} to ${dest}`);
                            setFen(chessInstance.current.fen()); // Update the board's FEN
                        }catch(e){
                            console.log(e);
                                console.log('Illegal move');
                                chessgroundInstance.current.set({ fen: chessInstance.current.fen() }); // Reset to the last valid position
                        }
                    },
                },
            });
        }

        // Cleanup on unmount
        return () => {
            if (chessgroundInstance.current) {
                chessgroundInstance.current.destroy();
            }
        };
    }, [fen]); // Re-run the effect when FEN changes

    return <div ref={boardRef} style={{ width: '400px', height: '400px' }} />;
};

export default Chessboard;
