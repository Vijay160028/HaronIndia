/**
 * Check if user profile is complete
 * Required fields: phoneNumber, pinCode, village, city, state, bankAccountNumber, bankAddress, ifscCode, kisanCardNumber
 */
export const isProfileComplete = (user) => {
  if (!user) return false;

  const requiredFields = [
    'phoneNumber',
    'pinCode',
    'village',
    'city',
    'state',
    'bankAccountNumber',
    'bankAddress',
    'ifscCode',
    'kisanCardNumber',
  ];

  return requiredFields.every(field => {
    const value = user[field];
    return value && value.trim() !== '' && value !== null && value !== undefined;
  });
};

/**
 * Get missing profile fields
 */
export const getMissingProfileFields = (user) => {
  if (!user) return [];

  const requiredFields = [
    { key: 'phoneNumber', label: 'Mobile Number' },
    { key: 'pinCode', label: 'PIN Code' },
    { key: 'village', label: 'Village' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'bankAccountNumber', label: 'Bank Account Number' },
    { key: 'bankAddress', label: 'Bank Address' },
    { key: 'ifscCode', label: 'IFSC Code' },
    { key: 'kisanCardNumber', label: 'Kisan Card Number' },
  ];

  return requiredFields.filter(field => {
    const value = user[field.key];
    return !value || value.trim() === '' || value === null || value === undefined;
  }).map(field => field.label);
};

