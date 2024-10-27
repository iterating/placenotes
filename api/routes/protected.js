const express = require('express');
const router = express.Router();
const passport = require('./passport');

router.get('/protected', passport.authenticate('jwt', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  res.send('Hello, authenticated user!');
});

module.exports = router;