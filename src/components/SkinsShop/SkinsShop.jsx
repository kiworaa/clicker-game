// src/components/SkinsShop/SkinsShop.jsx
import React from 'react';
import styles from './SkinsShop.module.scss';
import { SKINS_CONFIG, SKIN_CATEGORIES } from '../../utils/skinsConfig';

const SkinsShop = ({
  duiktcoins,
  ownedSkins,      // { bodyColor: ['id1', 'id2'], accessory: ['idA'] }
  equippedSkins,   // { bodyColor: 'id1', accessory: 'idA' }
  onBuySkin,
  onEquipSkin,
}) => {
  return (
    <div className={styles.skinsShop}>
      <p className={styles.duiktcoinsDisplay}>Ваші Duiktcoins: <strong>{duiktcoins} DC</strong></p>
      {Object.entries(SKINS_CONFIG).map(([categoryId, items]) => (
        <div key={categoryId} className={styles.categorySection}>
          <h2>
            {categoryId === SKIN_CATEGORIES.BODY_COLOR && 'Кольори Тіла'}
            {categoryId === SKIN_CATEGORIES.ACCESSORY && 'Аксесуари'}
            {/* Додайте назви для інших категорій */}
          </h2>
          <div className={styles.itemsGrid}>
            {items.map((item) => {
              const isOwned = ownedSkins[categoryId]?.includes(item.id);
              const isEquipped = equippedSkins[categoryId] === item.id;

              return (
                <div
                  key={item.id}
                  className={`${styles.skinItem} ${isEquipped ? styles.equipped : ''} ${isOwned ? styles.owned : ''}`}
                >
                  <div className={styles.itemPreview} style={categoryId === SKIN_CATEGORIES.BODY_COLOR ? { backgroundColor: item.value } : {}}>
                    {/* Для аксесуарів можна додати SVG прев'ю, якщо потрібно */}
                    {categoryId === SKIN_CATEGORIES.ACCESSORY && item.value && <span className={styles.accessoryNamePreview}>{item.name}</span>}
                    {categoryId === SKIN_CATEGORIES.BODY_COLOR && <div className={styles.colorNamePreview}>{item.name}</div>}
                  </div>
                  {/* <p className={styles.itemName}>{item.name}</p> */}
                  
                  {!isOwned && <p className={styles.itemCost}>Ціна: {item.cost} DC</p>}

                  {isOwned ? (
                    isEquipped ? (
                      <button disabled className={styles.actionButton}>Екіпіровано</button>
                    ) : (
                      <button onClick={() => onEquipSkin(categoryId, item.id)} className={`${styles.actionButton} ${styles.equipButton}`}>
                        Екіпірувати
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onBuySkin(categoryId, item.id, item.cost)}
                      disabled={duiktcoins < item.cost}
                      className={`${styles.actionButton} ${styles.buyButton}`}
                    >
                      Купити
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkinsShop;