const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const https = require("https");
const File = require("./model/fileSchema");
const multer = require("multer");
const http = require("http");
const session = require("express-session");
const { UserLike } = require("./model/userLikeSchema");

// const UserSchema = require("./model/userSchema");

const app = express();

// Set up code
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/applicationSubmitted.html", (req, res) => {
  res.sendFile(__dirname + "/views/pages/applicationSubmitted.html");
});

// Connect to Mongo DB
// const mongoURL =
//   "mongodb+srv://boepartners:missyangus123@cluster0.dm8gvgf.mongodb.net/BOE";

// mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// --------------------------------------------------------------------- //
// Subscribe Page Schema

const BOESchema = new mongoose.Schema({
  Organization: String,
  First_Name: {
    type: String,
    required: [false, "Please enter first name"],
  },
  Last_Name: {
    type: String,
    required: [false, "Please enter last name"],
  },
  Email: {
    type: String,
    required: [false, "Please enter email"],
  },
  AppliedForTrade: String,
  Resume: String,
  SubscriberTradeOfInterest1: String,
  SubscriberTradeOfInterest2: String,
  SubscriberTradeOfInterest3: String,
  City: String,
  Zipcode: {
    type: Number,
    required: [false, "Please enter numeric value"],
  },
  Additional_Comments: String,
  Date: String,
});

// --------------------------------------------------------------------- //

// Multer file storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/${req.body.organization + "_" + req.body.email}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else if (file.mimetype.split("/")[1] === "jpg") {
    cb(null, true);
  } else if (file.mimetype.split("/")[1] === "png") {
    cb(null, true);
  } else if (file.mimetype.split("/")[1] === "img") {
    cb(null, true);
  } else {
    cb(new Error("Not an image!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Get application data
app.post("/", upload.single("resume"), async (req, res) => {
  const postedDate = new Date().toLocaleDateString("en-us", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const Application = mongoose.model("Application", BOESchema);
  const application = new Application({
    Organization: req.body.organization,
    First_Name: req.body.firstname,
    Last_Name: req.body.lastname,
    Email: req.body.email,
    AppliedForTrade: req.body.appliedForTrade,
    Additional_Comments: req.body.additionalcomments,
    Date: postedDate,
  });
  application.save();
  res.redirect("/applicationSubmitted.html");
});

// Redirect to external application page, store user data
app.post("/index.html2", function (req, res) {
  const postedDate = new Date().toLocaleDateString("en-us", {
    year: "numeric",
    month: "numeric",
    // day: "numeric",
  });
  const External_Applicant = mongoose.model("External_Applicant", BOESchema);
  const external_applicant = new External_Applicant({
    Organization: req.body.organization,
    Date: postedDate,
  });
  external_applicant.save();
  res.redirect(req.body.orgApplicationURL);
});

// --------------------------------------------------------------------- //
// Subcriber Page - Save to Database

app.post("/usersignup", function (req, res) {
  const postedDate = new Date().toLocaleDateString("en-us", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  // store in BOE database
  const Subscriber = mongoose.model("Subscriber", BOESchema);
  try { 
  const subscriber = new Subscriber({
    First_Name: req.body.fname,
    Last_Name: req.body.lname,
    Email: req.body.email,
    City: req.body.city,
    Zipcode: req.body.zipcode,
    SubscriberTradeOfInterest1: req.body.trade1,
    SubscriberTradeOfInterest2: req.body.trade2,
    SubscriberTradeOfInterest3: req.body.trade3,
    Date: postedDate,
  });
  subscriber.save(); // Check if subscriber saved in DB. Then reroute based on success or failure.
  // res.redirect("/");
   res.render("pages/success", {
    title: "Success",
   });
} catch {
  res.render("pages/failure", {
    title: "Failure",
   });
}
  // send to Mailchimp
  // const data = {
  //   members: [
  //     {
  //       email_address: userEmail,
  //       status: "subscribed",
  //       merge_fields: {
  //         FNAME: userFirstName,
  //         LNAME: userLastName,
  //         CITY: userCity,
  //         ZIPCODE: zipCode,
  //         TRADE1: trade1,
  //         TRADE2: trade2,
  //         TRADE3: trade3,
  //       },
  //     },
  //   ],
  // };
  // const jsonData = JSON.stringify(data);
  // const url = "https://us17.api.mailchimp.com/3.0/lists/a61fc42e0a";
  // const options = {
  //   method: "POST",
  //   auth: "HenryC:a1c299a97ae75e0e005592e3fa618060-us17",v // this key should not be public or in github
  // };
//   const request = https.request(  function (response) {
//     if (response.statusCode === 200) {
//       console.log(response.statusCode + " LO success");
//       res.sendFile(__dirname + "/views/pages/success.ejs");
//     } else {
//       console.log(response.statusCode + " LO failure");
//       res.sendFile(__dirname + "/views/pages/failure.ejs");
//     }
//     response.on("data", function (data) {
//       console.log(JSON.parse(data));
//     });
//   });
//   request.write(jsonData);
//   request.end();
 });


app.post("/failure", function (req, res) {
  res.redirect("/subscribe.ejs");
});

app.post("/success", function (req, res) {
  res.redirect("/");
});

app.post("/user-likes", async function (req, res) {
  const user = req.app.get("user");
  const schoolId = req.body.school_id;

  if (!user || !user.id || !schoolId) {
    return null;
  }

  const query = {
    school_id: schoolId,
    user_id: user.id,
  };

  const userLike = await UserLike.findOne(query);
  const isLiked = userLike ? !userLike.is_liked : true;

  const userLikeData = {
    user_id: user.id,
    school_id: schoolId,
    is_liked: isLiked,
  };

  const options = { upsert: true };
  await UserLike.findOneAndUpdate(query, userLikeData, options);
  res.redirect("back");
});

module.exports = app;
