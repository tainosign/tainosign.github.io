// src/components/ShiftTeam.jsx
import React, { useState, useEffect } from "react";
import ShiftPosition from "./ShiftPosition";

export default function ShiftTeam({ dateId, team, onUpdate }) {
  const [positions, setPositions] = useState(team.positions || []);

  // ✅ 親に変更を通知（保存時に反映される）
  useEffect(() => {
    onUpdate({
      ...team,
      positions,
    });
  }, [positions]);

  // ✅ ポジション追加
  const handleAddPosition = () => {
    const newPosition = {
      positionId: `pos_${Date.now()}`,
      name: `新しいポジション ${positions.length + 1}`,
      slots: [],
    };
    setPositions(prev => [...prev, newPosition]);
  };

  // ✅ ポジション削除
  const handleDeletePosition = (positionId) => {
    setPositions(prev => prev.filter(p => p.positionId !== positionId));
  };

  // ✅ ポジション更新
  const handleUpdatePosition = (updatedPosition) => {
    setPositions(prev =>
      prev.map(pos =>
        pos.positionId === updatedPosition.positionId ? updatedPosition : pos
      )
    );
  };

  return (
    <div className="p-3 my-2 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-gray-700">
          チーム: {team.name || team.teamId}
        </h4>
        <button
          onClick={handleAddPosition}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm
