const { Schema, model } = require('mongoose');
const validator = require('validator')

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

      validator: function (el) {
        return el === this.password
      },
      message: 'Password are not the same!'
    },
  },
})

const User = model('User', userSchema)
module.exports = User;