// src/components/Upgrades/UpgradeItem.jsx
import React from 'react';
import styles from './UpgradeItem.module.scss';
// Не потрібен імпорт UPGRADES_CONFIG тут, якщо ми не робимо специфічної логіки за ID

const UpgradeItem = ({
  config,
  currentLevel,
  currentCost,
  onBuy,
  userCredits
  // duiktcoinBonus, // Можна використовувати для відображення фінального ефекту
  // globalMultiplier
}) => {
  if (!config) {
    return null;
  }

  const canAfford = userCredits >= currentCost;
  const isMaxLevel = config.maxLevel !== null && currentLevel >= config.maxLevel;

  let benefitDescription = '';
  if (config.type === 'ADD_BASE_CPC') {
    benefitDescription = `+${config.valueIncrement} до сили кліку`;
  } else if (config.type === 'ADD_BASE_CPS') {
    benefitDescription = `+${config.valueIncrement} кредит/сек`;
  } else if (config.type === 'GLOBAL_MULTIPLIER') {
    benefitDescription = `+${(config.valueIncrement * 100).toFixed(0)}% до глобального множника`;
  }

  return (
    <div className={styles.upgradeItem}>
      <div> {/* Обгортка для контенту, крім кнопки */}
        <div className={styles.header}>
          {config.icon && <span className={styles.icon}>{config.icon}</span>}
          <h3>
            {config.name} (Рівень: {currentLevel})
            {isMaxLevel && <span className={styles.maxLevelLabel}> (MAX)</span>}
          </h3>
        </div>
        <p className={styles.description}>{config.description}</p>
        {!isMaxLevel && benefitDescription && (
          <p className={styles.details}>
            Покращення: {benefitDescription}
          </p>
        )}
      </div>

      {isMaxLevel ? (
        <p className={styles.maxLevelReached}>Досягнуто максимального рівня!</p>
      ) : (
        <button
          onClick={() => onBuy(config.id)}
          disabled={!canAfford}
          className={styles.upgradeButton}
        >
          Купити за {currentCost.toLocaleString()}
        </button>
      )}
    </div>
  );
};

export default UpgradeItem;