// const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Strategy } = require("passport-local");
const { UserSchema } = require("./model/userSchema");

let User = null;

const isValidPassword = async (userInput, password) => {
  return await bcrypt.compare(userInput, password);
};

const LoginStrategy = new Strategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      User = req.app.get("UserModel");
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, {
          message: "Email is incorrect. Please try again.",
        });
      }

      const isValid = await isValidPassword(password, user.password);
      if (!isValid) {
        return done(null, false, {
          message: "Incorrect password. Please try again.",
        });
      }
      return done(null, user);
    } catch (e) {
      return done(null, false, {
        message: "Something went wrong with your sign in. Please try again.",
      });
    }
  }
);

passport.serializeUser((user, done) => {
  // This saves the whole user obj into the session cookie,
  // but typically you will see just user.id passed in.
  done(null, user);
});

passport.deserializeUser(async (req, { _id }, done) => {
  const User = mongoose.model("User", UserSchema);
  User.findById(_id).then((user) => {
    if (user) {
      req.app.set("user", {
        id: user.id,
        name: user.name,
        email: user.email,
      });
      return done(null, user);
    } else {
      req.app.set("user", null);
      done(null, null);
    }
  });
});

passport.use("local-signin", LoginStrategy);
