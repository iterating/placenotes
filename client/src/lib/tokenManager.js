let token = localStorage.getItem('token');
let tokenChangeCallbacks = [];

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
  tokenChangeCallbacks.forEach(callback => callback(newToken));
};

export const getToken = () => token;

export const onTokenChange = (callback) => {
  tokenChangeCallbacks.push(callback);
  return () => {
    tokenChangeCallbacks = tokenChangeCallbacks.filter(cb => cb !== callback);
  };
};
