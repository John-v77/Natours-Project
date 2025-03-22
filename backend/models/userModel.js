const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'User name is required']
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true,
    lowercase: true,
    vaslidate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm a password'],
    validate: {
      // Only works on CREATE or SAVE
      validator: function (el) {
        return el === this.password
      },
      message: 'Passwords are not the same!'
    },
  },
  passwordChangedAt: Date,
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getime() / 1000, 10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // returns false if has not changed. 
  return false;
}

const User = model('User', userSchema);

module.exports = User;