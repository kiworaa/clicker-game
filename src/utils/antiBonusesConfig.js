// src/utils/antiBonusesConfig.js
export const ANTI_BONUSES_CONFIG = {
  VIRUS_ATTACK: {
    id: 'VIRUS_ATTACK',
    name: 'Вірусна Атака!',
    description: 'Ваша система інфікована! Клікання тимчасово неможливе.',
    type: 'DISABLE_CLICK', // Тип ефекту
    duration: 15000, // 15 секунд в мілісекундах
    message: 'Кнопка кліку заблокована!',
  },
  LAG_SPIKE: {
    id: 'LAG_SPIKE',
    name: 'Стрибок Затримки!',
    description: 'Сервер перевантажений! Ваш дохід від кліків тимчасово зменшено.',
    type: 'REDUCE_CPC_PERCENTAGE', // Зменшує CPC на відсоток
    duration: 20000, // 20 секунд
    effect: {
      reductionPercentage: 0.5, // Зменшення на 50% (тобто множник буде 0.5)
    },
    message: 'Дохід від кліків зменшено на 50%!',
  },
  DATA_LEAK: {
    id: 'DATA_LEAK',
    name: 'Витік Даних!',
    description: 'Ваш пасивний дохід тимчасово знижено через витік даних.',
    type: 'REDUCE_CPS_PERCENTAGE', // Зменшує CPS на відсоток
    duration: 25000, // 25 секунд
    effect: {
      reductionPercentage: 0.75, // Зменшення на 75% (тобто множник буде 0.25)
    },
    message: 'Пасивний дохід зменшено на 75%!',
  },
  // Можна додати інші антибонуси
};

// Список ID всіх антибонусів для випадкового вибору
export const ANTI_BONUS_IDS = Object.keys(ANTI_BONUSES_CONFIG);