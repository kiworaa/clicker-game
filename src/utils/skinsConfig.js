// src/utils/skinsConfig.js

export const SKIN_CATEGORIES = {
  BODY_COLOR: 'bodyColor',
  ACCESSORY: 'accessory',
  // Можна додати інші категорії, наприклад, EYES, MOUTH тощо.
};

export const SKINS_CONFIG = {
  [SKIN_CATEGORIES.BODY_COLOR]: [
    { id: 'default_body', name: 'Стандартний Синій', cost: 0, value: '#61dafb', isDefault: true },
    { id: 'red_body', name: 'Червоне Тіло', cost: 5, value: '#f44336' },
    { id: 'green_body', name: 'Зелене Тіло', cost: 5, value: '#4caf50' },
    { id: 'purple_body', name: 'Фіолетове Тіло', cost: 10, value: '#9c27b0' },
    { id: 'gold_body', name: 'Золоте Тіло', cost: 25, value: '#ffc107' },
  ],
  [SKIN_CATEGORIES.ACCESSORY]: [
    { id: 'no_accessory', name: 'Без Аксесуара', cost: 0, value: null, isDefault: true }, // 'value: null' означає відсутність
    { id: 'top_hat', name: 'Циліндр', cost: 15, value: 'top_hat' }, // 'value' може бути ключем для SVG або CSS класу
    { id: 'sunglasses', name: 'Окуляри', cost: 15, value: 'sunglasses' },
    { id: 'crown', name: 'Корона', cost: 50, value: 'crown' },
  ],
};

// Функція для отримання початково екіпірованих частин
export const getDefaultEquippedSkins = () => {
  const defaultSkins = {};
  for (const categoryId in SKINS_CONFIG) {
    const category = SKINS_CONFIG[categoryId];
    const defaultItem = category.find(item => item.isDefault);
    if (defaultItem) {
      defaultSkins[categoryId] = defaultItem.id;
    }
  }
  return defaultSkins;
};

// Функція для отримання початково куплених частин (всі безкоштовні)
export const getDefaultOwnedSkins = () => {
  const owned = {};
  for (const categoryId in SKINS_CONFIG) {
    owned[categoryId] = SKINS_CONFIG[categoryId]
      .filter(item => item.cost === 0)
      .map(item => item.id);
  }
  return owned;
};