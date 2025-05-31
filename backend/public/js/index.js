console.log('Hello from parcel21')
import '@babel/polyfill';
import { login } from "./login";

// // DOM elements
const loginForm = document.querySelector('.form');

// DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  login(email, password);
});