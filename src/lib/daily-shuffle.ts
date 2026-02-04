/**
 * Get a seed based on the current date
 * This ensures the shuffle changes daily but stays consistent throughout the day
 */
function getDailySeed(): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function to convert date string to number
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Shuffle array using Fisher-Yates algorithm with a seed
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Get 4 random items from an array that reshuffle daily
 */
export function getDailyRandomItems<T>(items: T[], count: number = 4): T[] {
  if (items.length === 0) return [];
  if (items.length <= count) return items;
  
  const seed = getDailySeed();
  const shuffled = seededShuffle(items, seed);
  return shuffled.slice(0, count);
}
