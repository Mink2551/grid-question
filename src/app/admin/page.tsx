"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../../../lib/firebase";

type Tile = {
  question: string;
  revealed: boolean;
};

const AdminPage: React.FC = () => {
  const [tiles, setTiles] = useState<Record<string, Tile>>({});
  const [popupData, setPopupData] = useState<{ key: string; question: string } | null>(null);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const tilesRef = ref(database, "tiles");
    onValue(tilesRef, (snapshot) => {
      const data = snapshot.val();
      setTiles(data || {});
    });

    // Listen for popup status
    const popupRef = ref(database, "popup");
    onValue(popupRef, (snapshot) => {
      const data = snapshot.val();
      setPopupData(data || null);
    });
  }, []);

  const handleAddQuestion = () => {
    if (!newQuestion) return;

    const newTileKey = `tile${Date.now()}`;
    update(ref(database, `tiles/${newTileKey}`), { question: newQuestion, revealed: false });
    setNewQuestion("");
  };

  const handleDeleteQuestion = (tileKey: string) => {
    remove(ref(database, `tiles/${tileKey}`));
  };

  const toggleReveal = (tileKey: string, revealed: boolean) => {
    update(ref(database, `tiles/${tileKey}`), { revealed: !revealed });
  };

  const openPopupManually = (tileKey: string) => {
    update(ref(database, "activePopup"), { key: tileKey, question: tiles[tileKey].question });
  };

  const closePopup = () => {
    remove(ref(database, "activePopup")); // ลบ popup ออกจาก database
  };

  const tileArray = Object.entries(tiles);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Panel</h1>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Add New Question</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
            placeholder="Enter a new question"
          />
          <button
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Question List</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Question</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tileArray.map(([key, tile], index) => (
            <tr key={key} className={tile.revealed ? "bg-green-100" : "bg-red-100"}>
              <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{tile.question}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {tile.revealed ? "Revealed" : "Hidden"}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button onClick={() => openPopupManually(key)} className="bg-blue-500 px-2 py-1 text-white rounded-lg">
                  Popup
                </button>
                <button
                  onClick={closePopup}
                  className="bg-purple-500 text-white ml-2 px-2 py-1 rounded-lg hover:bg-purple-600"
                >
                  Close
                </button>
                <button onClick={() => toggleReveal(key, tile.revealed)} className="bg-yellow-500 px-2 py-1 text-white rounded-lg mx-2">
                  {tile.revealed ? "Hide" : "Reveal"}
                </button>
                <button onClick={() => handleDeleteQuestion(key)} className="bg-red-500 px-2 py-1 text-white rounded-lg">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {popupData && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Active Popup</h2>
          <p>Key: {popupData.key}</p>
          <p>Question: {popupData.question}</p>
          <button
            onClick={closePopup}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 mt-4"
          >
            Close Active Popup
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
