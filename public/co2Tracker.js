// Configuration
const CONFIG = {
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  animationDuration: 1000, // 1 second
  decimalPlaces: 2
};

// State
let currentSavings = 0;
let refreshIntervalId = null;

/**
 * Format a number with the specified number of decimal places
 * @param {number} value - The number to format
 * @returns {string} The formatted number as a string
 */
function formatNumber(value) {
  return parseFloat(value).toFixed(CONFIG.decimalPlaces);
}

/**
 * Update the displayed equivalents based on CO2 saved
 * @param {number} kgSavings - CO2 savings in kilograms
 */
function updateCO2Equivalents(kgSavings) {
  // Equivalents removed per user request
  return;
}

/**
 * Update the CO2 savings display in the UI without animation
 * @param {number} newSavings - The new CO2 savings value in kg
 */
function updateCO2SavingsDisplay(newSavings) {
  const co2Element = document.getElementById('co2-savings');
  if (!co2Element) return;

  // Update directly without animation
  const end = parseFloat(newSavings);
  currentSavings = end;
  
  // Update the display immediately
  co2Element.textContent = `${formatNumber(currentSavings)} kg CO₂ saved`;
  
  // Skip equivalents update since it's removed
}

/**
 * Fetch and update CO2 savings from the server
 * @returns {Promise<void>}
 */
async function fetchAndUpdateCO2Savings() {
  try {
    const response = await fetch('/api/user/co2-savings', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success !== false) { // Check if the request was successful
      updateCO2SavingsDisplay(data.co2Saved || 0);
    } else {
      console.error('API error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching CO2 savings:', error);
    // You might want to show a user-friendly message in the UI
    const co2Element = document.getElementById('co2-savings');
    if (co2Element) {
      co2Element.textContent = 'Error loading data';
      co2Element.style.color = '#ff4444'; // Indicate error with red color
    }
  }
}

/**
 * Start automatically refreshing the CO2 savings
 */
function startAutoRefresh() {
  // Clear any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  
  // Initial fetch
  fetchAndUpdateCO2Savings();
  
  // Set up interval for auto-refresh
  refreshIntervalId = setInterval(fetchAndUpdateCO2Savings, CONFIG.refreshInterval);
}

/**
 * Stop automatically refreshing the CO2 savings
 */
function stopAutoRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Start auto-refresh
  startAutoRefresh();


  // Initialize equivalents with current savings (likely 0 until first fetch)
  updateCO2Equivalents(currentSavings);

  
  // Listen for custom events that might indicate CO2 savings updates
  document.addEventListener('carpool-created', fetchAndUpdateCO2Savings);
  document.addEventListener('carpool-joined', fetchAndUpdateCO2Savings);
  
  // Also update when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fetchAndUpdateCO2Savings();
    }
  });
});

// Export functions for testing or other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateCO2SavingsDisplay,
    fetchAndUpdateCO2Savings,
    startAutoRefresh,
    stopAutoRefresh,
    formatNumber,
    CONFIG,
    updateCO2Equivalents
  };
}
