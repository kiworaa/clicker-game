
## Встановлення та запуск

### Вимоги

*   Node.js (рекомендована версія 18.x або 20.x)
*   npm (зазвичай встановлюється разом з Node.js) або yarn/pnpm

### Локальний запуск

1.  **Клонуйте репозиторій:**
    ```bash
    git clone https://github.com/kiworaa/clicker-game.git
    cd clicker-game
    ```

2.  **Встановіть залежності:**
    ```bash
    npm install
    ```
    *(або `yarn install`, `pnpm install`)*

3.  **Запустіть сервер розробки:**
    ```bash
    npm run dev
    ```
    Додаток буде доступний за адресою `http://localhost:5173` (або іншим портом, вказаним Vite).

4.  **Для створення продакшн-збірки:**
    ```bash
    npm run build
    ```
    Зібрані файли з'являться в папці `dist`.

5.  **Для попереднього перегляду продакшн-збірки:**
    ```bash
    npm run preview
    ```

## Основні функціональні модулі

*   **Клік-механіка:** (`App.jsx` - `handleClick`, розрахунок `creditsPerClick`)
*   **Апгрейди:** (`App.jsx` - `handleBuyUpgrade`, `upgradesConfig.js`, `UpgradeItem.jsx`)
*   **Бонуси:** (`App.jsx` - `handleActivateBonus`, `bonusesConfig.js`, `BonusItem.jsx`, `Modal.jsx`)
*   **Кастомізація Персонажа (Скіни):** (`App.jsx` - `handleBuySkin`, `handleEquipSkin`, `skinsConfig.js`, `Character.jsx`, `SkinsShop.jsx`, `Modal.jsx`)
*   **Престиж:** (`App.jsx` - `handlePrestige`, розрахунок `duiktcoinsToGain` та `duiktcoinBonusMultiplier`)
*   **Антибонуси:** (`App.jsx` - логіка `activeAntiBonus`, `antiBonusesConfig.js`)
*   **Збереження даних:** (`db/indexedDB.js`, інтеграція в `App.jsx` через `useEffect`)
*   **Анімації:** (Використання `framer-motion` в `App.jsx` та інших компонентах)

## Плани на майбутнє / Можливі покращення

*   [ ] Розширити список апгрейдів, бонусів та антибонусів.
*   [ ] Додати більше частин для кастомізації персонажа.
*   [ ] Реалізувати систему досягнень (Achievements).
*   [ ] Додати звукові ефекти та фонову музику.
*   [ ] Впровадити більш складні механіки антибонусів.
*   [ ] Створити лідерборд (вимагатиме бекенду або сторонніх сервісів).
*   [ ] Покращити анімації та загальний візуальний стиль.
*   [ ] Оптимізація продуктивності для дуже тривалої гри.
*   [ ] Додати локалізацію (підтримка кількох мов).

## Автор

[ksudie] - [https://github.com/kiworaa] - [saranukdaniil@gmail.com]
