/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    console.log(res, "maxxy");

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};

const logout = async () => {

  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      location.reload(true);
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
}


module.exports = {
  login,
  logout
}