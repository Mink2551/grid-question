"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../../../lib/firebase";

type Tile = {
  question: string;
  revealed: boolean;
};

type ActivePopup = {
  key: string;
  question: string;
} | null;

const GamePage: React.FC = () => {
  const [tiles, setTiles] = useState<Record<string, Tile>>({});
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);

  useEffect(() => {
    const tilesRef = ref(database, "tiles");
    const popupRef = ref(database, "activePopup");

    // Sync tiles data
    onValue(tilesRef, (snapshot) => {
      const data = snapshot.val();
      setTiles(data || {});
    });

    // Sync active popup data
    onValue(popupRef, (snapshot) => {
      setActivePopup(snapshot.val());
    });
  }, []);

  const handleTileClick = (tileKey: string, revealed: boolean) => {
    const tileRef = ref(database, `tiles/${tileKey}`);
    update(tileRef, { revealed: !revealed });

    // If tile is not revealed, set popup
    if (!revealed) {
      const popupRef = ref(database, "activePopup");
      update(popupRef, { key: tileKey, question: tiles[tileKey].question });
    }
  };

  const closePopup = () => {
    const popupRef = ref(database, "activePopup");
    remove(popupRef); // ลบ popup ออกจาก database
  };

  const tileArray = Object.entries(tiles);

  return (
    <div className="p-6 min-h-screen overflow-hidden">
      <div className="grid grid-cols-5 xl:scale-150 lg:scale-125 md:scale-110 absolute left-[50%] gap-2 -translate-x-[50%] top-[50%] -translate-y-[50%]">
        {tileArray.map(([key, tile], index) => (
          <div
            key={key}
            onClick={() => handleTileClick(key, tile.revealed)}
            className={`relative flex items-center justify-center w-24 h-24 border-2 rounded-lg cursor-pointer ${
              tile.revealed ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <div className="absolute top-1 left-1 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              ?
            </div>
            {index + 1}
          </div>
        ))}
      </div>

      {/* Popup */}
      {activePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg h-[200px] text-axl w-[90vw] max-w-[900px]">
            <h2 className="text-xl font-bold mb-4">Question</h2>
            <p className="mb-4">{activePopup.question}</p>
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
