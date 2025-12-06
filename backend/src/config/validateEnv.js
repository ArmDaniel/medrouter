/**
 * Validates that all required environment variables are set
 * @throws {Error} if any required variable is missing
 */
function validateEnv() {
  const required = [
    'DB_USER',
    'DB_HOST',
    'DB_NAME',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Warn about optional but recommended variables
  const recommended = [
    'MEDGEMMA_API_URL',
    'MISTRAL_IMAGE_API_URL'
  ];

  const missingRecommended = recommended.filter(varName => !process.env[varName]);
  
  if (missingRecommended.length > 0) {
    console.warn(
      '[WARNING] Optional environment variables not set:',
      missingRecommended.join(', ')
    );
    console.warn('Some features may not work correctly without these variables.');
  }

  console.log('[Environment] All required environment variables validated successfully');
}

module.exports = validateEnv;
