// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './App.module.scss';
import { UPGRADES_CONFIG } from './utils/upgradesConfig';
import UpgradeItem from './components/Upgrades/UpgradeItem';
import { BONUSES_CONFIG } from './utils/bonusesConfig';
import BonusItem from './components/Bonuses/BonusItem';
import Modal from './components/Modal/Modal';
import { saveGameState, loadGameState, clearGameState } from './db/indexedDB';
import { SKINS_CONFIG, SKIN_CATEGORIES, getDefaultEquippedSkins, getDefaultOwnedSkins } from './utils/skinsConfig';
import Character from './components/Character/Character';
import SkinsShop from './components/SkinsShop/SkinsShop';
import { ANTI_BONUSES_CONFIG, ANTI_BONUS_IDS } from './utils/antiBonusesConfig';

// --- Початкові Налаштування ---
const INITIAL_CREDITS = 0;
const INITIAL_TOTAL_CREDITS_EARNED = 0;
const INITIAL_BASE_CPC = 1;
const INITIAL_BASE_CPS = 0;
const INITIAL_DUIKTCOINS = 0;
const PRESTIGE_CREDIT_REQUIREMENT = 1000000;
const PRESTIGE_POINTS_DIVISOR = 500000;
const DUIKTCOIN_BONUS_PER_POINT = 0.01;

const getInitialUpgradeLevels = () => {
  const levels = {};
  for (const upgradeId in UPGRADES_CONFIG) {
    levels[upgradeId] = 0;
  }
  return levels;
};
const getInitialBonusCooldowns = () => {
  const cooldowns = {};
  for (const bonusId in BONUSES_CONFIG) {
    cooldowns[bonusId] = 0;
  }
  return cooldowns;
};

function App() {
  // --- Стан Гри ---
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [totalCreditsEarnedThisPrestige, setTotalCreditsEarnedThisPrestige] = useState(INITIAL_TOTAL_CREDITS_EARNED);
  const [duiktcoins, setDuiktcoins] = useState(INITIAL_DUIKTCOINS);
  const [baseCreditsPerClick, setBaseCreditsPerClick] = useState(INITIAL_BASE_CPC);
  const [creditsPerClick, setCreditsPerClick] = useState(INITIAL_BASE_CPC);
  const [baseCreditsPerSecond, setBaseCreditsPerSecond] = useState(INITIAL_BASE_CPS);
  const [effectiveCreditsPerSecond, setEffectiveCreditsPerSecond] = useState(INITIAL_BASE_CPS);
  const [upgradeLevels, setUpgradeLevels] = useState(getInitialUpgradeLevels());
  const [activeEffects, setActiveEffects] = useState({});
  const [bonusCooldowns, setBonusCooldowns] = useState(getInitialBonusCooldowns());
  const [ownedSkins, setOwnedSkins] = useState(getDefaultOwnedSkins());
  const [equippedSkins, setEquippedSkins] = useState(getDefaultEquippedSkins());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isBonusesModalOpen, setIsBonusesModalOpen] = useState(false);
  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState(false);
  const [isSkinsShopModalOpen, setIsSkinsShopModalOpen] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [activeAntiBonus, setActiveAntiBonus] = useState(null);
  const ANTI_BONUS_TRIGGER_INTERVAL = 10000; 
  const ANTI_BONUS_CHANCE = 0.5; 

  const duiktcoinBonusMultiplier = 1 + (duiktcoins * DUIKTCOIN_BONUS_PER_POINT);
  const globalMultiplierFromUpgrades = useCallback(() => {
    return Object.keys(upgradeLevels).reduce((acc, id) => {
      const level = upgradeLevels[id];
      const config = UPGRADES_CONFIG[id];
      if (config && config.type === 'GLOBAL_MULTIPLIER' && level > 0) {
        return acc * (1 + config.valueIncrement * level);
      }
      return acc;
    }, 1);
  }, [upgradeLevels]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadGame = async () => {
      const savedState = await loadGameState();
      if (savedState) {
        setCredits(savedState.credits || INITIAL_CREDITS);
        setTotalCreditsEarnedThisPrestige(savedState.totalCreditsEarnedThisPrestige || INITIAL_TOTAL_CREDITS_EARNED);
        setDuiktcoins(savedState.duiktcoins || INITIAL_DUIKTCOINS);
        setBaseCreditsPerClick(savedState.baseCreditsPerClick || INITIAL_BASE_CPC);
        setBaseCreditsPerSecond(savedState.baseCreditsPerSecond || INITIAL_BASE_CPS);
        setUpgradeLevels(savedState.upgradeLevels || getInitialUpgradeLevels());
        setBonusCooldowns(savedState.bonusCooldowns || getInitialBonusCooldowns());
        setOwnedSkins(savedState.ownedSkins || getDefaultOwnedSkins());
        setEquippedSkins(savedState.equippedSkins || getDefaultEquippedSkins());
      }
      setIsGameLoaded(true);
    };
    loadGame();
  }, []);

  useEffect(() => {
    if (!isGameLoaded) return;
    const gameStateToSave = {
      credits, totalCreditsEarnedThisPrestige, duiktcoins,
      baseCreditsPerClick, baseCreditsPerSecond,
      upgradeLevels, bonusCooldowns,
      ownedSkins, equippedSkins,
    };
    saveGameState(gameStateToSave).catch(err => console.error("Не вдалося зберегти гру:", err));
  }, [
    credits, totalCreditsEarnedThisPrestige, duiktcoins,
    baseCreditsPerClick, baseCreditsPerSecond,
    upgradeLevels, bonusCooldowns,
    ownedSkins, equippedSkins,
    isGameLoaded
  ]);

  useEffect(() => {
    const gMultiplier = globalMultiplierFromUpgrades();
    let cpcBonusMultiplier = 1;
    for (const bonusId in activeEffects) {
      if (activeEffects[bonusId] > currentTime) {
        const bonusConfig = BONUSES_CONFIG[bonusId];
        if (bonusConfig?.effect?.type === 'MULTIPLY_CPC') {
          cpcBonusMultiplier *= bonusConfig.effect.multiplier;
        }
      }
    }
    let cpcAntiBonusMultiplier = 1;
    let cpsAntiBonusMultiplier = 1;
    let isClickActuallyDisabled = false;
    if (activeAntiBonus && activeAntiBonus.endTime > currentTime) {
      const antiConfig = activeAntiBonus.config;
      if (antiConfig.type === 'REDUCE_CPC_PERCENTAGE' && antiConfig.effect) {
        cpcAntiBonusMultiplier = 1 - antiConfig.effect.reductionPercentage;
      }
      if (antiConfig.type === 'REDUCE_CPS_PERCENTAGE' && antiConfig.effect) {
        cpsAntiBonusMultiplier = 1 - antiConfig.effect.reductionPercentage;
      }
      if (antiConfig.type === 'DISABLE_CLICK') {
        isClickActuallyDisabled = true;
      }
    }
    const finalCPC = isClickActuallyDisabled ? 0 : Math.floor(baseCreditsPerClick * cpcBonusMultiplier * duiktcoinBonusMultiplier * gMultiplier * cpcAntiBonusMultiplier);
    setCreditsPerClick(Math.max(isClickActuallyDisabled ? 0 : 1, finalCPC));
    const finalCPS = Math.floor(baseCreditsPerSecond * duiktcoinBonusMultiplier * gMultiplier * cpsAntiBonusMultiplier);
    setEffectiveCreditsPerSecond(Math.max(0, finalCPS));
  }, [
    baseCreditsPerClick, baseCreditsPerSecond, activeEffects, currentTime,
    duiktcoinBonusMultiplier, globalMultiplierFromUpgrades, upgradeLevels, activeAntiBonus
  ]);

  useEffect(() => {
    if (effectiveCreditsPerSecond > 0) {
      const intervalId = setInterval(() => {
        const earnedCPS = effectiveCreditsPerSecond;
        setCredits(prev => prev + earnedCPS);
        setTotalCreditsEarnedThisPrestige(prev => prev + earnedCPS);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [effectiveCreditsPerSecond]);

  useEffect(() => {
    const newActiveEffectsCopy = { ...activeEffects };
    let changed = false;
    for (const bonusId in newActiveEffectsCopy) {
      if (newActiveEffectsCopy[bonusId] <= currentTime) {
        delete newActiveEffectsCopy[bonusId];
        changed = true;
      }
    }
    if (changed) setActiveEffects(newActiveEffectsCopy);
  }, [currentTime, activeEffects]);

  useEffect(() => {
    if (!isGameLoaded) return;
    const triggerAntiBonus = () => {
      if (!activeAntiBonus && ANTI_BONUS_IDS.length > 0 && Math.random() < ANTI_BONUS_CHANCE) {
        const randomIndex = Math.floor(Math.random() * ANTI_BONUS_IDS.length);
        const randomAntiBonusId = ANTI_BONUS_IDS[randomIndex];
        const antiBonusConfig = ANTI_BONUSES_CONFIG[randomAntiBonusId];
        if (antiBonusConfig) {
          console.log(`Activating anti-bonus: ${antiBonusConfig.name}`);
          setActiveAntiBonus({ config: antiBonusConfig, endTime: Date.now() + antiBonusConfig.duration });
        }
      }
    };
    const intervalId = setInterval(triggerAntiBonus, ANTI_BONUS_TRIGGER_INTERVAL);
    return () => clearInterval(intervalId);
  }, [activeAntiBonus, isGameLoaded]);

  useEffect(() => {
    if (activeAntiBonus && activeAntiBonus.endTime <= currentTime) {
      console.log(`Deactivating anti-bonus: ${activeAntiBonus.config.name}`);
      setActiveAntiBonus(null);
    }
  }, [currentTime, activeAntiBonus]);

  const isClickCurrentlyDisabled = activeAntiBonus?.config.type === 'DISABLE_CLICK' && activeAntiBonus?.endTime > currentTime;

  const handleClick = (event) => {
    if (isClickCurrentlyDisabled) {
      console.warn("Click is disabled by anti-bonus!");
      return;
    }
    const earned = creditsPerClick;
    setCredits(prev => prev + earned);
    setTotalCreditsEarnedThisPrestige(prev => prev + earned);
    const newText = { id: Date.now() + Math.random(), text: `+${earned.toLocaleString()}` };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1500);
  };

  const calculateUpgradeCost = useCallback((upgradeConfig, level) => {
    if (!upgradeConfig || (upgradeConfig.maxLevel !== null && level >= upgradeConfig.maxLevel)) { return Infinity; }
    return Math.floor(upgradeConfig.initialCost * Math.pow(upgradeConfig.costMultiplier, level));
  }, []);

  const handleBuyUpgrade = useCallback((upgradeId) => {
    const upgradeConfig = UPGRADES_CONFIG[upgradeId];
    if (!upgradeConfig) return;
    const currentLevel = upgradeLevels[upgradeId] || 0;
    if (upgradeConfig.maxLevel !== null && currentLevel >= upgradeConfig.maxLevel) { alert('Досягнуто максимального рівня!'); return; }
    const cost = calculateUpgradeCost(upgradeConfig, currentLevel);
    if (credits >= cost) {
      setCredits(prev => prev - cost);
      setUpgradeLevels(prev => ({ ...prev, [upgradeId]: (prev[upgradeId] || 0) + 1 }));
      if (upgradeConfig.type === 'ADD_BASE_CPC') {
        setBaseCreditsPerClick(prevCpc => prevCpc + upgradeConfig.valueIncrement);
      } else if (upgradeConfig.type === 'ADD_BASE_CPS') {
        setBaseCreditsPerSecond(prevCps => prevCps + upgradeConfig.valueIncrement);
      }
    } else { alert('Недостатньо кредитів!'); }
  }, [credits, upgradeLevels, calculateUpgradeCost]);

  const handleActivateBonus = useCallback((bonusId) => {
    const bonusConfig = BONUSES_CONFIG[bonusId];
    if (!bonusConfig) return;
    const lastActivationTime = bonusCooldowns[bonusId] || 0;
    if (currentTime < lastActivationTime + bonusConfig.cooldown) { alert('Бонус на перезарядці!'); return; }
    if (credits < bonusConfig.cost) { alert('Недостатньо кредитів для активації бонусу!'); return; }
    setCredits(prev => prev - bonusConfig.cost);
    setBonusCooldowns(prev => ({ ...prev, [bonusId]: currentTime }));
    if (bonusConfig.type === 'INSTANT_REWARD' && bonusConfig.reward) {
      const rewardAmount = Math.floor(Math.random() * (bonusConfig.reward.max - bonusConfig.reward.min + 1)) + bonusConfig.reward.min;
      setCredits(prev => prev + rewardAmount);
      setTotalCreditsEarnedThisPrestige(prev => prev + rewardAmount);
      alert(`Ви отримали ${rewardAmount.toLocaleString()} кредитів!`);
    } else if (bonusConfig.type === 'TEMPORARY_EFFECT' && bonusConfig.duration) {
      setActiveEffects(prev => ({ ...prev, [bonusId]: currentTime + bonusConfig.duration }));
    }
  }, [credits, bonusCooldowns, currentTime]);

  const canPrestige = totalCreditsEarnedThisPrestige >= PRESTIGE_CREDIT_REQUIREMENT;
  const duiktcoinsToGain = canPrestige ? Math.floor(totalCreditsEarnedThisPrestige / PRESTIGE_POINTS_DIVISOR) : 0;

  const resetGameToInitial = (keepDuiktcoins = false, newDuiktcoinsAmount = 0) => {
    setCredits(INITIAL_CREDITS);
    setTotalCreditsEarnedThisPrestige(INITIAL_TOTAL_CREDITS_EARNED);
    setBaseCreditsPerClick(INITIAL_BASE_CPC);
    setBaseCreditsPerSecond(INITIAL_BASE_CPS);
    setUpgradeLevels(getInitialUpgradeLevels());
    setActiveEffects({});
    setBonusCooldowns(getInitialBonusCooldowns());
    setEquippedSkins(getDefaultEquippedSkins());
    if (!keepDuiktcoins) {
      setDuiktcoins(INITIAL_DUIKTCOINS);
      setOwnedSkins(getDefaultOwnedSkins());
    } else {
      setDuiktcoins(prev => prev + newDuiktcoinsAmount);
    }
  };

  const handlePrestige = () => {
    if (!canPrestige || duiktcoinsToGain <= 0) { alert("Ви ще не готові до престижу або не заробите Duiktcoins!"); return; }
    resetGameToInitial(true, duiktcoinsToGain);
    setIsPrestigeModalOpen(false);
    alert(`Вітаємо з Престижем! Ви отримали ${duiktcoinsToGain} Duiktcoin(s).`);
  };

  const handleFullRestart = () => {
    if (window.confirm("Ви впевнені, що хочете повністю скинути гру? Весь прогрес, включаючи Duiktcoins та скіни, буде втрачено!")) {
      clearGameState().then(() => {
        resetGameToInitial(false);
        alert("Гру повністю скинуто.");
      }).catch(err => {
        console.error("Помилка при очищенні IndexedDB:", err);
        alert("Не вдалося повністю скинути гру через помилку бази даних.");
      });
    }
  };

  const handleBuySkin = useCallback((categoryId, itemId, cost) => {
    if (duiktcoins >= cost && !(ownedSkins[categoryId]?.includes(itemId))) {
      setDuiktcoins(prev => prev - cost);
      setOwnedSkins(prev => {
        const categorySkins = prev[categoryId] ? [...prev[categoryId]] : [];
        if (!categorySkins.includes(itemId)) { categorySkins.push(itemId); }
        return { ...prev, [categoryId]: categorySkins };
      });
      setEquippedSkins(prev => ({ ...prev, [categoryId]: itemId }));
    } else if (ownedSkins[categoryId]?.includes(itemId)) {
      alert("Ви вже маєте цей предмет!");
    } else { alert("Недостатньо Duiktcoins!"); }
  }, [duiktcoins, ownedSkins]);

  const handleEquipSkin = useCallback((categoryId, itemId) => {
    if (ownedSkins[categoryId]?.includes(itemId)) {
      setEquippedSkins(prev => ({ ...prev, [categoryId]: itemId }));
    } else { alert("Спочатку придбайте цей предмет!"); }
  }, [ownedSkins]);

  return (
    <div className={`${styles.app} ${activeAntiBonus && activeAntiBonus.endTime > currentTime ? styles.antiBonusActiveState : ''}`}>
      <Character equippedSkins={equippedSkins} />
      <AnimatePresence>
        {activeAntiBonus && activeAntiBonus.endTime > currentTime && (
          <motion.div
            className={styles.antiBonusActiveBanner}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <p><strong>Увага: {activeAntiBonus.config.name}</strong></p>
            <p>{activeAntiBonus.config.description}</p>
            <p className={styles.antiBonusTimer}>Залишилось: {Math.max(0, Math.ceil((activeAntiBonus.endTime - currentTime) / 1000))}с</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={styles.appHeader}>
        <div className={styles.headerTopBar}>
            <h1 className={styles.gameTitle}>Clicker Game</h1>
            <div className={styles.headerActions}>
              <button className={`${styles.actionButton} ${styles.skinsShopButton}`} onClick={() => setIsSkinsShopModalOpen(true)}>Кастомізація</button>
              <button className={`${styles.actionButton} ${styles.bonusesButton}`} onClick={() => setIsBonusesModalOpen(true)}>Бонуси</button>
              <button className={`${styles.actionButton} ${styles.prestigeButton}`} onClick={() => setIsPrestigeModalOpen(true)} disabled={!canPrestige && duiktcoins === 0}>
                Престиж {duiktcoins > 0 ? `(${duiktcoins} DC)` : ''}
              </button>
            </div>
        </div>
        <p className={styles.creditsDisplay}>Кредити: {credits.toLocaleString()}</p>
        {(effectiveCreditsPerSecond > 0 || duiktcoins > 0 || globalMultiplierFromUpgrades() > 1) && (
          <p className={styles.cpsDisplay}>
            Пасивно: {effectiveCreditsPerSecond.toLocaleString()} / сек
            (Множник: x{(duiktcoinBonusMultiplier * globalMultiplierFromUpgrades()).toFixed(2)})
            {activeAntiBonus && activeAntiBonus.config.type === 'REDUCE_CPS_PERCENTAGE' && activeAntiBonus.endTime > currentTime &&
              <span className={styles.antiBonusEffectIndicator}> (-{activeAntiBonus.config.effect.reductionPercentage * 100}%)</span>}
          </p>
        )}
        <div className={styles.clickButtonWrapper}>
          <motion.button
            className={`${styles.clickButton} ${isClickCurrentlyDisabled ? styles.clickButtonDisabled : ''}`}
            onClick={(e) => handleClick(e)}
            whileHover={!isClickCurrentlyDisabled ? { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 17 } } : {}}
            whileTap={!isClickCurrentlyDisabled ? { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } } : {}}
            disabled={isClickCurrentlyDisabled}
          >
            Клікай мене! (+{creditsPerClick.toLocaleString()})
            {isClickCurrentlyDisabled && " (Заблоковано)"}
          </motion.button>
          <div className={styles.floatingTextContainer}>
            <AnimatePresence>
              {floatingTexts.map(ft => (
                <motion.div
                  key={ft.id}
                  className={styles.floatingText}
                  initial={{ opacity: 1, y: 0, x: '-50%' }}
                  animate={{ opacity: 0, y: -60 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {ft.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className={styles.upgradesSectionFull}>
        <h2>Апгрейди</h2>
        <div className={styles.upgradesGrid}>
            {Object.values(UPGRADES_CONFIG).map(upgradeConfig => (
                <UpgradeItem
                    key={upgradeConfig.id}
                    config={upgradeConfig}
                    currentLevel={upgradeLevels[upgradeConfig.id] || 0}
                    currentCost={calculateUpgradeCost(upgradeConfig, upgradeLevels[upgradeConfig.id] || 0)}
                    onBuy={handleBuyUpgrade}
                    userCredits={credits}
                />
            ))}
        </div>
      </div>

      <Modal isOpen={isBonusesModalOpen} onClose={() => setIsBonusesModalOpen(false)} title="Доступні Бонуси">
        {Object.values(BONUSES_CONFIG).map(bonusConfig => {
            const endTime = activeEffects[bonusConfig.id];
            const lastActivation = bonusCooldowns[bonusConfig.id] || 0;
            let cooldownRemaining = 0;
            if (endTime > currentTime && bonusConfig.type === 'TEMPORARY_EFFECT') {
                cooldownRemaining = endTime - currentTime;
            } else {
                cooldownRemaining = (lastActivation + bonusConfig.cooldown) - currentTime;
            }
            return ( <BonusItem key={bonusConfig.id} config={bonusConfig} onActivate={handleActivateBonus} userCredits={credits} isActive={endTime > currentTime} cooldownRemaining={cooldownRemaining > 0 ? cooldownRemaining : 0} /> );
        })}
      </Modal>
      <Modal isOpen={isPrestigeModalOpen} onClose={() => setIsPrestigeModalOpen(false)} title="Престиж">
        <div className={styles.prestigeInfo}>
          <p>Поточні Duiktcoins: <strong>{duiktcoins}</strong></p>
          <p>Бонус до доходу від Duiktcoins: <strong>+{( (duiktcoinBonusMultiplier - 1) * 100).toFixed(0)}%</strong></p>
          <hr />
          <p>Для наступного престижу потрібно заробити: {PRESTIGE_CREDIT_REQUIREMENT.toLocaleString()} кредитів (всього за цю сесію).</p>
          <p>Всього зароблено кредитів (ця сесія): {totalCreditsEarnedThisPrestige.toLocaleString()}</p>
          {canPrestige ? ( <> <p className={styles.prestigeGain}>Ви отримаєте: <strong>{duiktcoinsToGain}</strong> Duiktcoin(s)</p> <button className={styles.confirmPrestigeButton} onClick={handlePrestige}>Підтвердити Престиж</button> </> ) : ( <p>Наберіть більше кредитів, щоб отримати Duiktcoins!</p> )}
          <p className={styles.prestigeWarning}>Увага! Престиж скине ваші кредити, апгрейди та активні бонуси.</p>
        </div>
      </Modal>
      <Modal isOpen={isSkinsShopModalOpen} onClose={() => setIsSkinsShopModalOpen(false)} title="Кастомізація Персонажа">
        <SkinsShop duiktcoins={duiktcoins} ownedSkins={ownedSkins} equippedSkins={equippedSkins} onBuySkin={handleBuySkin} onEquipSkin={handleEquipSkin} />
      </Modal>

      <button className={`${styles.actionButton} ${styles.fullRestartButton}`} onClick={handleFullRestart}>
        Повний Рестарт
      </button>
    </div>
  );
}

export default App;