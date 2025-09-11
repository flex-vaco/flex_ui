/**
 * Utility functions for calculating weekly availability
 */

/**
 * Get the start of the week (Monday) for a given date
 * If the date is a weekday (Mon-Fri), use that date as the start
 * If the date is a weekend (Sat-Sun), find the next Monday
 * @param {Date} date - The input date
 * @returns {Date} - The Monday of that week or the date itself if it's a weekday
 */
export const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    
    // If it's a weekday (Monday=1 to Friday=5), use the date itself
    if (day >= 1 && day <= 5) {
        return d;
    }
    
    // If it's Saturday (6), go to next Monday (add 2 days)
    if (day === 6) {
        d.setDate(d.getDate() + 2);
        return d;
    }
    
    // If it's Sunday (0), go to next Monday (add 1 day)
    if (day === 0) {
        d.setDate(d.getDate() + 1);
        return d;
    }
    
    return d;
};

/**
 * Get the end of the week (Friday) for a given date
 * @param {Date} date - The input date
 * @returns {Date} - The Friday of that week
 */
export const getEndOfWeek = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Monday + 4 days = Friday
    return endOfWeek;
};

/**
 * Generate 4 weeks starting from the Monday of the selected duration start date
 * @param {string} durationFrom - The start date in YYYY-MM-DD format
 * @returns {Array} - Array of 4 week objects with start and end dates
 */
export const generateFourWeeks = (durationFrom) => {
    if (!durationFrom) return [];
    
    const startDate = new Date(durationFrom);
    const startOfFirstWeek = getStartOfWeek(startDate);
    
    const weeks = [];
    
    for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startOfFirstWeek);
        weekStart.setDate(startOfFirstWeek.getDate() + (i * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4); // Monday to Friday
        
        weeks.push({
            weekNumber: i + 1,
            startDate: weekStart.toISOString().split('T')[0], // YYYY-MM-DD format
            endDate: weekEnd.toISOString().split('T')[0],
            label: `Week ${i + 1}`
        });
    }
    
    return weeks;
};

/**
 * Calculate availability percentage based on available hours and hours per week
 * @param {number} availableHours - Hours available in the week
 * @param {number} hoursPerWeek - Total hours per week (e.g., 40)
 * @returns {number} - Availability percentage (0-100)
 */
export const calculateAvailabilityPercentage = (availableHours, hoursPerWeek = 40) => {
    if (hoursPerWeek <= 0) return 0;
    return Math.round((availableHours / hoursPerWeek) * 100);
};

/**
 * Get color class based on availability percentage
 * @param {number} percentage - Availability percentage (0-100)
 * @returns {string} - CSS class name for styling
 */
export const getAvailabilityColorClass = (percentage) => {
    if (percentage >= 100) return 'availability-full';
    if (percentage >= 75) return 'availability-high';
    if (percentage >= 50) return 'availability-medium';
    if (percentage >= 25) return 'availability-low';
    return 'availability-none';
};

/**
 * Format availability display text
 * @param {number} availableHours - Hours available
 * @param {number} hoursPerWeek - Total hours per week
 * @returns {string} - Formatted display text
 */
export const formatAvailabilityText = (availableHours, hoursPerWeek = 40) => {
    const percentage = calculateAvailabilityPercentage(availableHours, hoursPerWeek);
    return `${availableHours}/${hoursPerWeek}h (${percentage}%)`;
};

/**
 * Get week date range display text
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} - Formatted date range
 */
export const formatWeekDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
};
