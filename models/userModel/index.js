const crypto = require("crypto")
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Not a valid email"]
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, "Conform Password is required"],
    validate: {
      //this only work on create and save !!
      validator: function (el) {
        return el === this.password
      },
      message: "password and conform password are not the same"
    }
  },
  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetTokenExperies: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  };
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next()
});

userSchema.methods.correctPassword = async function (
  password,
  userPassword
) {
  return await bcrypt.compare(password, userPassword)
};

userSchema.methods.changedPassword = async function (JWTTimeStamp) {
  const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
  if (JWTTimeStamp < changedTimeStamp) {
    return true
  };
  return false
}

userSchema.methods.createPasswordResetToken = async function (email) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log({ resetToken })
  console.log(this.passwordResetToken)
  this.passwordResetTokenExperies = Date.now() + 10 * 60 * 1000
  return resetToken
}

const User = mongoose.model('User', userSchema);

module.exports = User;