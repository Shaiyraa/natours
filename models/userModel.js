const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide name"]
  },
  email: {
    type: String,
    required: [true, "Provide an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Wrong email format"]
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Provide a password"],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Provide passwordConfirm"],
    validate: {
      validator: function (value) {
        return value === this.password
      },
      message: "Passwords are not the same"
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  // return if password was not modified
  if (!this.isModified('password')) return next();

  // else hash new password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  // return if password was not modified
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the query
  this.find({ active: { $ne: false } });
  next();
})

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.didChangePassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // change milliseconds to seconds and convert to integer

    return passwordChangedAtTimestamp > JWTTimestamp;
  };

  // false = user didn't change password
  return false;
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Date.now() + 10 minutes

  return resetToken
};


const User = mongoose.model('User', userSchema);

module.exports = User;