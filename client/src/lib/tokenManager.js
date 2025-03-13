let token = localStorage.getItem('token');
let tokenChangeCallbacks = [];
let tokenExpirationWarningCallbacks = [];

// Constants for token expiration times
const TOKEN_WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiration

export const validateToken = (token) => {
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000;
  } catch {
    return null;
  }
};

export const getTimeUntilExpiration = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return 0;
  return Math.max(0, expirationTime - Date.now());
};

export const isTokenExpiringSoon = (token) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration > 0 && timeUntilExpiration < TOKEN_WARNING_THRESHOLD_MS;
};

export const setToken = (newToken) => {
  // Validate token before setting
  if (newToken && !validateToken(newToken)) {
    return false;
  }
  
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
    
    // Set up expiration warning
    const timeUntilExpiration = getTimeUntilExpiration(newToken);
    if (timeUntilExpiration > TOKEN_WARNING_THRESHOLD_MS) {
      const warningDelay = timeUntilExpiration - TOKEN_WARNING_THRESHOLD_MS;
      setTimeout(() => {
        if (validateToken(getToken())) {
          tokenExpirationWarningCallbacks.forEach(callback => callback());
        }
      }, warningDelay);
    }
  } else {
    localStorage.removeItem('token');
  }
  tokenChangeCallbacks.forEach(callback => callback(newToken));
  return true;
};

export const getToken = () => {
  // Validate token before returning
  if (token && !validateToken(token)) {
    localStorage.removeItem('token');
    token = null;
    tokenChangeCallbacks.forEach(callback => callback(null));
    return null;
  }
  return token;
};

export const onTokenChange = (callback) => {
  tokenChangeCallbacks.push(callback);
  return () => {
    tokenChangeCallbacks = tokenChangeCallbacks.filter(cb => cb !== callback);
  };
};

export const onTokenExpirationWarning = (callback) => {
  tokenExpirationWarningCallbacks.push(callback);
  return () => {
    tokenExpirationWarningCallbacks = tokenExpirationWarningCallbacks.filter(cb => cb !== callback);
  };
};

// Initialize token expiration check for the current token
if (token) {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (timeUntilExpiration > 0) {
    if (timeUntilExpiration < TOKEN_WARNING_THRESHOLD_MS) {
      // Token is already near expiration, trigger warning immediately
      setTimeout(() => {
        tokenExpirationWarningCallbacks.forEach(callback => callback());
      }, 0);
    } else {
      // Set timeout for future warning
      const warningDelay = timeUntilExpiration - TOKEN_WARNING_THRESHOLD_MS;
      setTimeout(() => {
        if (validateToken(getToken())) {
          tokenExpirationWarningCallbacks.forEach(callback => callback());
        }
      }, warningDelay);
    }
  }
}
