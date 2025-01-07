let token = localStorage.getItem('token');
let tokenChangeCallbacks = [];

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

export const setToken = (newToken) => {
  // Validate token before setting
  if (newToken && !validateToken(newToken)) {
    return false;
  }
  
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
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
