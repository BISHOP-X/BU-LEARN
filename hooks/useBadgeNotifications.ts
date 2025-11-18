import { useEffect, useState } from 'react';
import { checkAndAwardBadges, getBadgeDetails } from '../lib/badgeSystem';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
}

export function useBadgeNotifications(userId: string | null) {
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Checks for newly earned badges
   * Call this after significant user actions (upload, quiz completion, etc.)
   */
  const checkForNewBadges = async () => {
    if (!userId) return;

    try {
      const newBadgeIds = await checkAndAwardBadges(userId);
      
      if (newBadgeIds.length > 0) {
        const badgeDetails = await getBadgeDetails(newBadgeIds);
        setBadgeQueue(prev => [...prev, ...badgeDetails]);
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  };

  // Show next badge in queue
  useEffect(() => {
    if (badgeQueue.length > 0 && !modalVisible) {
      setCurrentBadge(badgeQueue[0]);
      setModalVisible(true);
    }
  }, [badgeQueue, modalVisible]);

  const handleCloseModal = () => {
    setModalVisible(false);
    setCurrentBadge(null);
    // Remove the shown badge from queue
    setBadgeQueue(prev => prev.slice(1));
  };

  return {
    currentBadge,
    modalVisible,
    handleCloseModal,
    checkForNewBadges,
  };
}
