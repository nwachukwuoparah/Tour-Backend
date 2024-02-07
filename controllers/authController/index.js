const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../../utils/appError");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/sendEmail");

const signToken = (id) => {
  return jwt.sign(
    { id: id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
};

const createSentToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  })
  createSentToken(newUser, 200, res)
  next()
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError("Email and password is required", 404))
  };
  const user = await User.findOne({ email }).select("+password")
  if (!user || (!await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email and password", 401))
  };
  const token = signToken(user._id)
  res.status(200).json({
    status: "success",
    token
  })
  next()
});

//CHecks on jwt
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get token and check if it is there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  };
  if (!token) {
    return next(new AppError("You are not logged in! log in to gain access.", 401))
  };
  //verifidation
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User with this token does not exist.", 401))
  };
  if (await currentUser.changedPassword(decoded.iat)) {
    return next(new AppError("User recently changed password please login in again.", 401))
  };
  // Grant access to the protected route
  req.user = currentUser;
  next()
});

//Autuorization
exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403))
    };
    next()
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on post email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError("User with this email not found", 404))
  }
  const resetToken = await user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })
  //generate a random token and send it as an email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? send a PATCH request with your new password and password 
  confirm to ${resetURL}.\n if you did not send this please igmore this email`
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message
    });
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetTokenExperies = undefined;
    await user.save({ validateBeforeSave: false });
    return new AppError(`There was an error sending Email to ${user.email} try again later`, 500)
  };

  res.status(200).json({
    status: "success",
    message: `Reset token has been sent to ${user.email}`
  })

});

exports.resetPassword = catchAsync(async (req, res, next) => {

  // Get user based on token
  const handleToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne(
    {
      passwordResetToken: handleToken,
      passwordResetTokenExperies: { $gt: Date.now() }
    }
  );

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 404))
  }
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetTokenExperies = undefined;
  await user.save()

  createSentToken(user, 200, res)
});

exports.updatePassword = catchAsync(async (req, res, next) => {

  const user = await User.findById(req.user.id).select("+password")
  console.log(req.body.currentPassword, user.password)
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong.", 404))
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save()

  const token = signToken(user._id)

  res.status(200).json({
    status: "success",
    token
  })

  next()
})

