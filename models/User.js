const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { GRADES, SUBJECTS } = require("../utils/constants.js");

/**
 * User model — supports three roles: student, parent, admin.
 * Parents can be linked to one or more students via the `children` field.
 * Students can be linked to a parent via `parent` field.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default in queries
    },
    role: {
      type: String,
      enum: ["student", "parent", "admin"],
      default: "student",
    },
    // Student-specific fields
    grade: {
      type: String, // e.g. "8th" — platform supports up to 8th class only
      enum: { values: GRADES, message: "Grade must be between 1st and 8th" },
      default: null,
    },
    subjects: {
      type: [String], // e.g. ["Maths", "Physics"]
      enum: { values: SUBJECTS, message: "Invalid subject" },
      default: [],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Parent-specific fields
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare candidate password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't leak password/version fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);