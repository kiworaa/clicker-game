// src/utils/upgradesConfig.js
export const UPGRADES_CONFIG = {
  CLICK_POWER_BASIC: {
    id: 'CLICK_POWER_BASIC',
    name: 'Основи Кліку',
    description: 'Збільшує кредити за клік на невелику величину.',
    initialCost: 10,
    costMultiplier: 1.15, // Менший множник для частої покупки
    valueIncrement: 1, // +1 до базової сили кліку
    type: 'ADD_BASE_CPC',
    maxLevel: 20,
    icon: '👆', // Проста іконка (опціонально)
  },
  AUTO_CLICKER_MK1: {
    id: 'AUTO_CLICKER_MK1',
    name: 'Авто-клікер Mk1',
    description: 'Автоматично генерує кредити кожну секунду.',
    initialCost: 150,
    costMultiplier: 1.25,
    valueIncrement: 1, // +1 до базового CPS
    type: 'ADD_BASE_CPS',
    maxLevel: 25,
    icon: '⚙️',
  },
  CLICK_BOOSTER_PRO: {
    id: 'CLICK_BOOSTER_PRO',
    name: 'Професійний Буст Кліку',
    description: 'Значно збільшує кредити за клік.',
    initialCost: 1000,
    costMultiplier: 1.4,
    valueIncrement: 10, // +10 до базової сили кліку
    type: 'ADD_BASE_CPC',
    maxLevel: 15,
    icon: '🚀',
  },
  PASSIVE_INCOME_HUB: {
    id: 'PASSIVE_INCOME_HUB',
    name: 'Центр Пасивного Доходу',
    description: 'Суттєво збільшує пасивний дохід.',
    initialCost: 5000,
    costMultiplier: 1.5,
    valueIncrement: 25, // +25 до базового CPS
    type: 'ADD_BASE_CPS',
    maxLevel: 10,
    icon: '💰',
  },
  EFFICIENCY_PROTOCOL: {
    id: 'EFFICIENCY_PROTOCOL',
    name: 'Протокол Ефективності',
    description: 'Зменшує вартість всіх інших апгрейдів (ефект невеликий, але сумується).',
    initialCost: 25000,
    costMultiplier: 2.5, // Дорогий апгрейд
    // valueIncrement тут не числовий, а відсотковий і впливає на інші апгрейди
    // Логіка цього буде складнішою і реалізується окремо
    // Для простоти, поки що цей апгрейд буде декоративним або його ефект не реалізований
    // Або ж, зробимо його як тимчасовий буст до заробітку
    valueIncrement: 0.01, // Наприклад, +1% до глобального множника заробітку за рівень
    type: 'GLOBAL_MULTIPLIER', // Новий тип для обробки
    maxLevel: 5,
    icon: '📈',
  },
  // Додайте ще апгрейдів за бажанням
};