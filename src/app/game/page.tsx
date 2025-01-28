"use client"

import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../../../lib/firebase";

type Tile = {
  question: string;
  revealed: boolean;
};

const GamePage: React.FC = () => {
  const [tiles, setTiles] = useState<Record<string, Tile>>({});
  const [selectedTile, setSelectedTile] = useState<{ key: string; question: string } | null>(null);

  useEffect(() => {
    const tilesRef = ref(database, "tiles");
    onValue(tilesRef, (snapshot) => {
      const data = snapshot.val();
      setTiles(data || {});
    });
  }, []);

  const handleTileClick = (tileKey: string, revealed: boolean) => {
    const tileRef = ref(database, `tiles/${tileKey}`);
    // Toggle revealed state
    update(tileRef, { revealed: !revealed });

    // If revealed, show the question in the popup
    if (!revealed) {
      setSelectedTile({ key: tileKey, question: tiles[tileKey].question });
    } else {
      setSelectedTile(null); // Close the popup if the tile is closed
    }
  };

  const closePopup = () => setSelectedTile(null);

  const tileArray = Object.entries(tiles); // Convert object to array for easier mapping

  return (
    <div className="p-6 min-h-screen overflow-hidden">
      <div className="grid grid-cols-5 scale-150 absolute left-[50%] gap-2 -translate-x-[50%] top-[50%] -translate-y-[50%]">
        {tileArray.map(([key, tile], index) => (
          <div
            key={key}
            onClick={() => handleTileClick(key, tile.revealed)}
            className={`relative flex items-center justify-center w-24 h-24 border-2 rounded-lg cursor-pointer ${
              tile.revealed ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {/* Tile number */}
            <div className="absolute top-1 left-1 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              ?
            </div>
            {tile.revealed ? '' : index + 1}
          </div>
        ))}
      </div>

      {/* Popup */}
      {selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg h-[200px] text-xl w-[90vw] max-w-[900px]">
            <h2 className="text-xl font-bold mb-4">Question</h2>
            <p className="mb-4">{selectedTile.question}</p>
            <button
              onClick={closePopup}
              className="px-4 py-2 mt-7 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
