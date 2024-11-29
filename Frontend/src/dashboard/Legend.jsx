import React from 'react';

export default function Legend({ fishCatches, onFishClick }){
  return (
    <div>
      <h3>Fish Legend</h3>
      <ul>
        {fishCatches.map((fish, index) => (
          <li key={fish._id} onClick={() => onFishClick(fish)}>
            <span>{index + 1}</span>
            <span>{fish.fishName}</span>
            <span>Rarity: {fish.rarityScore}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
