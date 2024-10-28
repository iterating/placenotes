
export const checkAuth = (req, res, next) => {
    if (req.checkAuth()) {
      return next();
    }
    return res.status(401).send({ error: 'Unauthorized' });
  };
