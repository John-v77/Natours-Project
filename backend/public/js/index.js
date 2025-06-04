console.log('Hello from parcel21')
import '@babel/polyfill';
import { login, logout } from "./login";
import { displayMap } from './mapbox';

// // DOM elements
const mapBox = document.getElementById('map');

const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
console.log(logOutBtn);



if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  console.log(locations, "locations");
  displayMap(locations);
}

// DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })
}

if (logOutBtn) { logOutBtn.addEventListener('click', logout) };

// document.querySelector('.form').addEventListener('submit', e => {
//   e.preventDefault();
//   login(email, password);
// });


