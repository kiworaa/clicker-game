// src/utils/bonusesConfig.js
export const BONUSES_CONFIG = {
  INSTANT_CREDITS_CASE: {
    id: 'INSTANT_CREDITS_CASE',
    name: 'Кейс з кредитами',
    description: 'Відкрийте, щоб отримати випадкову кількість кредитів!',
    type: 'INSTANT_REWARD', // Тип бонусу
    cost: 50, // Вартість покупки кейсу (може бути 0, якщо це безкоштовний бонус)
    // Параметри для миттєвої винагороди
    reward: {
      min: 25, // Мінімальна кількість кредитів
      max: 30000000, // Максимальна кількість кредитів
    },
    cooldown: 60000, // 60 секунд перезарядки в мілісекундах
  },
  DOUBLE_CLICKS_BOOSTER: {
    id: 'DOUBLE_CLICKS_BOOSTER',
    name: 'Подвійні Кліки',
    description: 'Подвоює кредити за клік на 30 секунд!',
    type: 'TEMPORARY_EFFECT',
    cost: 150,
    duration: 30000, // 30 секунд в мілісекундах
    effect: {
      type: 'MULTIPLY_CPC', // Multiply Credits Per Click
      multiplier: 2,
    },
    cooldown: 180000, // 3 хвилини перезарядки
  },
  // Можна додати більше бонусів тут
};