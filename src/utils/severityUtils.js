export function getSeverity(description = '') {
  const text = description.toLowerCase();
  
  // CRITICAL keywords (High urgency - unusable)
  const criticalKeywords = [
    'no water', 'water not available', 'flush not working', 'no flush',
    'very dirty', 'filthy', 'unhygienic', 'sewage', 'overflow', 'blocked', 'choked', 
    'full of waste', 'not usable', 'broken', 'damaged', 'closed', 'locked', 
    'no light', 'completely dark', 'unsafe', 'bad smell', 'stinking', 'infection', 'mosquito'
  ];
  
  // MODERATE keywords (Usable but needs improvement)
  const moderateKeywords = [
    'dirty', 'needs cleaning', 'not clean', 'messy',
    'low water', 'water leaking', 'tap not working',
    'dim light', 'light issue',
    'door issue', 'lock broken', 'seat damaged',
    'average', 'not maintained', 'okay but needs improvement'
  ];
  
  // Check for critical first
  if (criticalKeywords.some(keyword => text.includes(keyword))) {
    return {
      severity: 'CRITICAL',
      color: '#ef4444',
      label: '🚨 Critical'
    };
  }
  
  // Check for moderate
  if (moderateKeywords.some(keyword => text.includes(keyword))) {
    return {
      severity: 'MODERATE',
      color: '#f59e0b',
      label: '⚠️ Moderate'
    };
  }
  
  // Default LOW
  return {
    severity: 'LOW',
    color: '#10b981',
    label: '✅ Low'
  };
}

