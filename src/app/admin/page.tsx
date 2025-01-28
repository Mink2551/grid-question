"use client"

import React, { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../../../lib/firebase"

type Tile = {
  question: string;
  revealed: boolean;
};

const AdminPage: React.FC = () => {
  const [tiles, setTiles] = useState<Record<string, Tile>>({});
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const tilesRef = ref(database, "tiles");
    onValue(tilesRef, (snapshot) => {
      const data = snapshot.val();
      setTiles(data || {});
    });
  }, []);

  const handleAddQuestion = () => {
    if (!newQuestion) return;

    const newTileKey = `tile${Date.now()}`;
    const tileRef = ref(database, `tiles/${newTileKey}`);
    update(tileRef, { question: newQuestion, revealed: false });
    setNewQuestion("");
  };

  const handleDeleteQuestion = (tileKey: string) => {
    const tileRef = ref(database, `tiles/${tileKey}`);
    remove(tileRef);
  };

  const toggleReveal = (tileKey: string, revealed: boolean) => {
    const tileRef = ref(database, `tiles/${tileKey}`);
    update(tileRef, { revealed: !revealed });
  };

  const tileArray = Object.entries(tiles); // Convert object to array for mapping

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Panel</h1>

      {/* Add Question Section */}
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

      {/* Question List */}
      <div>
        <h2 className="text-lg font-bold mb-4">Question List</h2>
        <div className="overflow-x-auto">
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
                <tr
                  key={key}
                  className={`${tile.revealed ? "bg-green-100" : "bg-red-100"}`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{tile.question}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {tile.revealed ? (
                      <span className="text-green-600 font-bold">Revealed</span>
                    ) : (
                      <span className="text-red-600 font-bold">Hidden</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => toggleReveal(key, tile.revealed)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 mr-2"
                    >
                      {tile.revealed ? "Hide" : "Reveal"}
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(key)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;