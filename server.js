const app = require("./app");
const mongoose = require("mongoose");
const http = require("http");
const https = require("https");
const path = require("path");
const schools = require("./business.json");
const { UserModel, UserSchema } = require("./model/userSchema");
const users = [];
const DB =
  "mongodb+srv://boepartners:missyangus123@cluster0.dm8gvgf.mongodb.net/BOE";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION, APP SHUTTING NOW!!");
  console.log(err.message, err.name);
  process.exit(1);
});

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => {
    console.log("DB connected successfully");
  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started");
});

// register sign up

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    unique: false,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://boepartners:missyangus123@cluster0.dm8gvgf.mongodb.net/BOE",
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
require("./passport-config");
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// --------------------------------- ROUTES ------------------------------------ //

app.get("/", (req, res) => {
  res.render("pages/index", {
    schools: schools,
    isAuthenticated: req.isAuthenticated(),
  });
});
app.get("/subscribe", (req, res) => {
  res.render("pages/subscribe", {
    isAuthenticated: req.isAuthenticated(),
  });
});
app.get("/resources", (req, res) => {
  res.render("pages/resources", {
    isAuthenticated: req.isAuthenticated(),
  });
});
app.get("/contact", (req, res) => {
  res.render("pages/contact", {
    isAuthenticated: req.isAuthenticated(),
  });
});
app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("pages/profile", {
    schools: schools,
    name: req.user.name,
    email: req.user.email,
    date: req.user.date,
    isAuthenticated: req.isAuthenticated(),
  });
});

// -------------------------------- LOG IN ------------------------------------- //

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("pages/login", {
    isAuthenticated: req.isAuthenticated(),
  });
});

app.post("/login", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local-signin", (error, user, msg) => {
    if (error) {
      next(error);
    }

    if (!user) {
      // @TODO: Display login feedback to user on login screen
      console.log("Error logging in: ", msg.message);
    } // Call passport logIn method

    req.logIn(user, (error) => {
      if (error) {
        // @TODO: Handle errors
      }
      req.app.set("user", {
        id: user.id,
        name: user.name,
        email: user.email,
      });
      console.log("REQ>USER", req.user);
      res.render("pages/profile", {
        schools: schools,
        name: req.user.name,
        email: req.user.email,
        date: req.user.date,
        isAuthenticated: req.isAuthenticated(),
      });
    });
  })(req, res, next);
});

// -------------------------------- Register / Sign Up Page USER SCHEMA - LO (in model folder) ----------------------------------- //

// -------------------------------- Set User Modal for easy fetch in request like: req.app.get("UserModel") ---------------------- //
app.set("UserModel", UserModel);

// -------------------------------- Register / Sign Up Page - Save to Database - LO ------------------------------------- //

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("./pages/register", {
    isAuthenticated: req.isAuthenticated(),
  });
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const postedDate = new Date().toLocaleDateString("en-us", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const favSchools = [];
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      bcrypt.genSaltSync(8)
    );
    const User = mongoose.model("User", UserSchema);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      date: postedDate,
      favorites: favSchools,
    });
    user.save();
    users.push(user);
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

// -------------------------------- LOG OUT ------------------------------------- //

app.delete("/logout", (req, res, next) => {
  req.logOut((err) => {
    req.app.set("user", null);
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(4000);
