import express from 'express';
import passport from '../middleware/passport.js';

const router = express.Router();

router.route('/signup')
  .get((req, res) => {

  })

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {

});

export default router