const CookieHelper = require('@mozmeao/cookie-helper');

// create namespace
if (typeof window.Mozilla === 'undefined') {
    window.Mozilla = {};
}

window.Mozilla.Cookies = CookieHelper;
