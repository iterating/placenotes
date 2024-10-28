import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import userSchema from '../models/users.js';


passport.serializeUser((profile, done) => {
    done(null, profile.id);
  });
  
  passport.deserializeUser((id, done) => {
    return models.Profile.where({ id }).fetch()
      .then(profile => {
        if (!profile) {
          throw profile;
        }
        done(null, profile.serialize());
      })
      .error(error => {
        done(error, null);
      })
      .catch(() => {
        done(null, null, { message: 'No user found' });
      });
  });

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

//   passport.use(new JwtStrategy({
//     jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_KEY
//   }, async (payload, done) => {
//     try {
//       const user = await User.findById(payload.sub);
//       if (!user) {
//         return done(null, false);
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }   
//   }
//   ))


export default passport