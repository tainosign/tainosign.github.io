// ShiftPosition.jsx（抜粋）
export default function ShiftPosition({ dateId, teamId, position }) {
  const [slots, setSlots] = useState(position.slots || []);

  const addSlot = () => {
    const newSlot = {
      slotId: `slot_${Date.now()}`,
      member: null,
      time: "10:00",
    };
    setSlots(prev => [...prev, newSlot]);
  };

  return (
    <div className="shift-position">
      <h5>{position.positionId}</h5>
      <button onClick={addSlot}>+ スロット</button>
      {slots.map(slot => (
        <ShiftSlot key={slot.slotId} dateId={dateId} teamId={teamId} positionId={position.positionId} slot={slot} />
      ))}
    </div>
  );
}
