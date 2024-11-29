import React from 'react';
import { MdClose } from 'react-icons/md';

export default function FishResultsModal ({ fishInfo, image, onClose }){
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick}>
      <div>
        <button onClick={onClose} aria-label="Close modal">
          <MdClose />
        </button>
        <div>
          <img src={URL.createObjectURL(image)} alt={fishInfo.fishName} className={styles.fishImage} />
        </div>
        <h2>{fishInfo.fishName}</h2>
        <p>{fishInfo.joke}</p>

        <div>
          <div>
            <span>Rarity:</span>
            <span>{fishInfo.rarityScore}/10</span>
          </div>
          <div>
            <div style={{width: `${fishInfo.rarityScore * 10}%`}}></div>
          </div>
        </div>

        <div>
          <span>Weight:</span>
          <span>{fishInfo.weight} grams</span>
        </div>
        <div>
          <span>Length:</span>
          <span>{fishInfo.length} cm</span>
        </div>
        <div>
          <span>Date Caught:</span>
          <span>{fishInfo.dateCaught}</span>
        </div>
        <div>
          <span>Location:</span>
          <span>{fishInfo.location}</span>
        </div>

        <h3>Description</h3>
        <p>{fishInfo.description}</p>

        <h3>Fish Tale</h3>
        <p>{fishInfo.fishStory}</p>
      </div>
    </div>
  );
};
