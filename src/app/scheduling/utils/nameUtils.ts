/**
 * Utility functions for handling patient names
 */

/**
 * Capitalizes the first letter of each word in a name
 * Handles edge cases like:
 * - Multiple spaces between words
 * - Leading/trailing spaces
 * - Empty strings
 * - Special characters and hyphens
 * 
 * Examples:
 * - "john doe" → "John Doe"
 * - "MARIA SILVA" → "Maria Silva" 
 * - "josé da silva-santos" → "José Da Silva-Santos"
 * - "  ana  maria  " → "Ana Maria"
 */
export const capitalizePatientName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase() // Convert to lowercase first
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(' ') // Split by spaces
    .map(word => {
      if (!word) return word;
      
      // Handle hyphenated names (e.g., "silva-santos")
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }
      
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Format patient name for display
 * Same as capitalizePatientName but with additional safety checks
 */
export const formatPatientNameForDisplay = (name?: string | null): string => {
  if (!name) {
    return 'Nome não informado';
  }
  
  const capitalizedName = capitalizePatientName(name);
  return capitalizedName || 'Nome não informado';
};

/**
 * Prepare patient name for database storage
 * Ensures consistent formatting before saving
 */
export const preparePatientNameForStorage = (name: string): string => {
  return capitalizePatientName(name);
};