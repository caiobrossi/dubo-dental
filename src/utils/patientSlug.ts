interface PatientSlugData {
  name: string;
  id: string;
  dateOfBirth?: string;
}

export function createPatientSlug(name: string, id?: string, dateOfBirth?: string): string {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

  // If we have additional data, add unique identifier
  if (id) {
    const shortId = id.substring(0, 8);
    return `${baseSlug}-${shortId}`;
  }
  
  return baseSlug;
}

export function parsePatientSlug(slug: string): { name: string; id?: string } {
  const parts = slug.split('-');
  
  // Check if last part looks like an ID (8 characters, alphanumeric)
  const lastPart = parts[parts.length - 1];
  if (lastPart.length === 8 && /^[a-z0-9]+$/i.test(lastPart)) {
    // Remove the ID part and reconstruct the name
    const nameParts = parts.slice(0, -1);
    const name = nameParts
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { name, id: lastPart };
  }
  
  // No ID found, return the full slug as name
  const name = parts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return { name };
}