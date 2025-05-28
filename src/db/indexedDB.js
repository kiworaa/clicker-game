// src/db/indexedDB.js

const DB_NAME = 'ClickerGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';
const KEY_NAME = 'playerProgress'; // Ми будемо зберігати весь стан під одним ключем

let db;

// Функція для ініціалізації (або відкриття) бази даних
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Помилка відкриття IndexedDB:", event.target.error);
      reject("Помилка IndexedDB");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("IndexedDB успішно відкрито");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME); // Не використовуємо keyPath, бо ключ буде явним
        console.log(`Сховище об'єктів "${STORE_NAME}" створено`);
      }
    };
  });
};

// Функція для збереження стану гри
export const saveGameState = async (gameState) => {
  try {
    const currentDb = await initDB();
    const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(gameState, KEY_NAME); // Зберігаємо об'єкт gameState під ключем KEY_NAME

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        // console.log('Стан гри успішно збережено в IndexedDB');
        resolve();
      };
      transaction.onerror = (event) => {
        console.error('Помилка збереження стану гри:', event.target.error);
        reject('Помилка збереження');
      };
    });
  } catch (error) {
    console.error('Не вдалося отримати доступ до IndexedDB для збереження:', error);
    return Promise.reject(error);
  }
};

// Функція для завантаження стану гри
export const loadGameState = async () => {
  try {
    const currentDb = await initDB();
    const transaction = currentDb.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY_NAME);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        if (event.target.result) {
          // console.log('Стан гри успішно завантажено з IndexedDB:', event.target.result);
          resolve(event.target.result);
        } else {
          // console.log('Збережений стан гри не знайдено, завантаження значень за замовчуванням.');
          resolve(null); // Немає збережених даних
        }
      };
      request.onerror = (event) => {
        console.error('Помилка завантаження стану гри:', event.target.error);
        reject('Помилка завантаження');
      };
    });
  } catch (error) {
    console.error('Не вдалося отримати доступ до IndexedDB для завантаження:', error);
    return Promise.resolve(null); // Повертаємо null, щоб гра почалася зі значень за замовчуванням
  }
};

// Функція для очищення стану гри (наприклад, для тестування або скидання)
export const clearGameState = async () => {
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(KEY_NAME);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('Стан гри успішно видалено з IndexedDB.');
                resolve();
            };
            request.onerror = (event) => {
                console.error('Помилка видалення стану гри:', event.target.error);
                reject('Помилка видалення');
            };
        });
    } catch (error) {
        console.error('Не вдалося отримати доступ до IndexedDB для очищення:', error);
        return Promise.reject(error);
    }
};