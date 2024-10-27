import express from 'express';
import passport from '../middleware/passport.js';

const router = express.Router();

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  const token = req.user.generateToken();
  res.cookie('jwt', token);
  res.redirect('/protected');
});

export default router