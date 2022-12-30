const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
  },
  email: {
    type: String,
  },
  contactUrl: {
    type: String,
  },
});

const LocationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  logoUrl: {
    type: String,
    required: true,
    minlength: 1,
  },
  siteUrl: {
    type: String,
    required: true,
    minlength: 1,
  },
  applyUrl: {
    type: String,
    required: true,
    minlength: 1,
  },
  type: {
    type: String,
    required: true,
    minlength: 1,
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
  },
  location: LocationSchema,
  pointOfContact: ContactSchema,
  programs: {
    type: Array,
  },
  premiumMembership: Boolean,
});

const SchoolModel = mongoose.model("School", SchoolSchema);

exports.School = SchoolModel;
exports.SchoolSchema = SchoolSchema;

exports.School = SchoolModel;
exports.SchoolSchema = SchoolSchema;
