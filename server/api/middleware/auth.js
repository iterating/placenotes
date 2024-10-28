
export const isAuthenticated = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).send({ error: 'Unauthorized' });

export const setUser = (req, res, next) => {
  if (req.user && req.user._id && req.user.email) {
    res.locals.user = { _id: req.user._id, email: req.user.email };
    next();
  } else {
    res.status(400).send({ error: 'Are you logged in?' });
  }
};

