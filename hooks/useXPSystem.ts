import { useState } from 'react';

interface XPResult {
  success: boolean;
  newPoints: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export function useXPSystem() {
  const [xpToastVisible, setXpToastVisible] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ oldLevel: 1, newLevel: 1 });

  /**
   * Shows XP toast and level up modal if user leveled up
   */
  const handleXPAwarded = (result: XPResult) => {
    if (!result.success) return;

    // Show XP toast
    const earnedXP = result.newPoints - (result.oldLevel - 1) * 500; // Calculate earned XP in this action
    setXpAmount(earnedXP);
    setXpToastVisible(true);

    // Show level up modal if leveled up
    if (result.leveledUp) {
      setTimeout(() => {
        setLevelUpData({
          oldLevel: result.oldLevel,
          newLevel: result.newLevel,
        });
        setLevelUpModalVisible(true);
      }, 2500); // Show after XP toast disappears
    }
  };

  const hideXPToast = () => {
    setXpToastVisible(false);
  };

  const closeLevelUpModal = () => {
    setLevelUpModalVisible(false);
  };

  return {
    xpToastVisible,
    xpAmount,
    hideXPToast,
    levelUpModalVisible,
    levelUpData,
    closeLevelUpModal,
    handleXPAwarded,
  };
}
