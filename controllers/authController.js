const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user, status, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(status).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;


  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError("Provide email and password.", 400))

  const user = await User.findOne({ email }).select(("+password"))
  const correct = await user?.correctPassword(password)
  if (!user || !correct) return next(new AppError("Incorrect email or password.", 401))

  createSendToken(user, 200, res)
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: "success"
  })
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //check if token exists
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  };

  if (!token) return next(new AppError("Log in in order to get access.", 401));

  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exist
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User belonging to this token does no longer exist."));

  // check if user changed password
  if (user.didChangePassword(decoded.iat)) return next(new AppError("Password has been changed recently, please, log in again.", 401));

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // check if user still exist
      const user = await User.findById(decoded.id);
      if (!user) return next()

      // check if user changed password
      if (user.didChangePassword(decoded.iat)) return next()

      // GRANT ACCESS TO PROTECTED ROUTES
      res.locals.user = user;
    } catch (err) {
      return next()
    };
  };
  next();
};

exports.restrictToRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403))
    };
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) return next(new AppError("There is no user with this email address.", 404))

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }) // saving doc in order to actually store new token-related fields

  try {
    const passwordResetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, passwordResetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Password change token has been sent to your email address"
    });
  } catch (err) {
    // if something goes wrong, we don't need those anymore
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error while trying to send the email. Please, try again later.", 500));
  };

});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError("Token is invalid or has expired.", 404));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res)

});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  // get user
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new AppError("This user doesn't exist", 404))

  // check if password is correct
  const isPasswordCorrect = await user.correctPassword(oldPassword)
  if (!isPasswordCorrect) return next(new AppError("Incorrect password", 400))

  // change password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  createSendToken(user, 200, res)
});
