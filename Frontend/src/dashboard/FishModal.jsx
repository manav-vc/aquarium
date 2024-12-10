import React from 'react';
import { MdClose, MdScale, MdStraighten, MdDateRange, MdLocationOn, MdPerson, MdStars } from 'react-icons/md';

export default function FishModal({ fish, onClose }){
    if (!fish) return null;

  const InfoItem = ({ icon, label, value }) => (
    <div >
      <div>
        {icon}
        <span>{label}</span>
      </div>
      <div>{value}</div>
    </div>
  );

  return (
    <div onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close modal">
          <MdClose />
        </button>
        <h2>{fish.fishName}</h2>
        <div>
          <InfoItem icon={<MdStars />} label="Rarity Score" value={<span>{fish.rarityScore}</span>} />
          <InfoItem icon={<MdScale />} label="Weight" value={`${fish.weight}g`} />
          <InfoItem icon={<MdStraighten />} label="Length" value={`${fish.length}cm`} />
          <InfoItem icon={<MdDateRange />} label="Date Caught" value={new Date(fish.dateCaught).toLocaleDateString()} />
          <InfoItem icon={<MdLocationOn />} label="Location" value={`${fish.latitude.toFixed(4)}, ${fish.longitude.toFixed(4)}`} />
          <InfoItem icon={<MdPerson />} label="Caught By" value={fish.username} />
        </div>
        <div>
          <h3>Description</h3>
          <p>{fish.description}</p>
        </div>
      </div>
    </div>
  );
}