// src/components/Character/Character.jsx
import React from 'react';
import styles from './Character.module.scss';
import { SKINS_CONFIG, SKIN_CATEGORIES } from '../../utils/skinsConfig';

// Прості SVG для аксесуарів (можна зробити складніше)
const AccessoriesSVG = {
  top_hat: (color) => (
    <path d="M50 10 L70 10 L70 30 L65 30 L65 15 L55 15 L55 30 L50 30 Z M45 32 L75 32 L75 35 L45 35 Z" fill={color || '#333'} />
  ),
  sunglasses: (color) => (
    <>
      <ellipse cx="40" cy="45" rx="10" ry="5" fill={color || '#222'} />
      <ellipse cx="80" cy="45" rx="10" ry="5" fill={color || '#222'} />
      <path d="M50 45 L70 45" stroke={color || '#222'} strokeWidth="2" />
    </>
  ),
  crown: (color) => (
     <path d="M30 40 L35 25 L50 35 L65 25 L70 40 L30 40 M42 30a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6z" fill={color || 'gold'} />
  ),
};


const Character = ({ equippedSkins }) => {
  const bodyColorItem = SKINS_CONFIG[SKIN_CATEGORIES.BODY_COLOR].find(
    (s) => s.id === equippedSkins[SKIN_CATEGORIES.BODY_COLOR]
  );
  const bodyColorValue = bodyColorItem ? bodyColorItem.value : '#ccc';

  const accessoryItem = SKINS_CONFIG[SKIN_CATEGORIES.ACCESSORY].find(
    (s) => s.id === equippedSkins[SKIN_CATEGORIES.ACCESSORY]
  );
  const accessoryValue = accessoryItem ? accessoryItem.value : null;

  return (
    <div className={styles.characterContainer}>
      <svg viewBox="0 0 120 120" className={styles.characterSvg}>
        {/* Тіло */}
        <circle cx="60" cy="70" r="40" fill={bodyColorValue} />
        {/* Очі (прості) */}
        <circle cx="45" cy="60" r="5" fill="white" />
        <circle cx="75" cy="60" r="5" fill="white" />
        <circle cx="45" cy="60" r="2" fill="black" />
        <circle cx="75" cy="60" r="2" fill="black" />

        {/* Аксесуар */}
        {accessoryValue && AccessoriesSVG[accessoryValue] && AccessoriesSVG[accessoryValue]()}
      </svg>
    </div>
  );
};

export default Character;