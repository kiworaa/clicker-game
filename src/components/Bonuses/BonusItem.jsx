// src/components/Bonuses/BonusItem.jsx
import React from 'react';
import styles from './BonusItem.module.scss'; // Створимо його наступним

const BonusItem = ({
  config,
  onActivate,
  userCredits,
  isActive, // Для тимчасових бустерів
  cooldownRemaining, // Час до завершення перезарядки (в секундах)
}) => {
  if (!config) return null;

  const canAfford = config.cost === 0 || userCredits >= config.cost;
  const isOnCooldown = cooldownRemaining > 0;
  const isDisabled = isActive || isOnCooldown || !canAfford;

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return "0с";
    const seconds = Math.ceil(milliseconds / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m}хв ` : ''}${s}с`;
  };

  return (
    <div className={`${styles.bonusItem} ${isActive ? styles.active : ''}`}>
      <h3>{config.name}</h3>
      <p>{config.description}</p>
      {config.cost > 0 && <p>Вартість: {config.cost.toLocaleString()} кредитів</p>}

      {isActive && config.type === 'TEMPORARY_EFFECT' && (
        <p className={styles.activeTimer}>Активний: {formatTime(cooldownRemaining)}</p>
      )}
      {isOnCooldown && !isActive && (
        <p className={styles.cooldownTimer}>Перезарядка: {formatTime(cooldownRemaining)}</p>
      )}

      <button
        onClick={() => onActivate(config.id)}
        disabled={isDisabled}
        className={styles.activateButton}
      >
        {isActive ? 'Активний' : isOnCooldown ? 'Перезарядка' : 'Активувати'}
      </button>
    </div>
  );
};

export default BonusItem;