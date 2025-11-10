// ShiftTeam.jsx（抜粋）
export default function ShiftTeam({ dateId, team }) {
  const [positions, setPositions] = useState(team.positions || []);

  const addPosition = () => {
    const newPos = { positionId: `pos_${Date.now()}`, slots: [] };
    setPositions(prev => [...prev, newPos]);
  };

  return (
    <div className="shift-team">
      <h4>{team.teamId}</h4>
      <button onClick={addPosition}>+ ポジション</button>
      {positions.map(pos => (
        <ShiftPosition key={pos.positionId} dateId={dateId} teamId={team.teamId} position={pos} />
      ))}
    </div>
  );
}
