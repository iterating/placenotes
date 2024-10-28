
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).send({ error: 'Unauthorized' });
  };

export const setUser = (req, res, next) => {
  res.locals.user = req.user;
  next();
};