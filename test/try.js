process.env.IP = '127.0.0.1';
process.env.PORT = '4444';
const { browser } = require('./index');
let MainPage = require('./po');
browser.newChromeSession();
browser.url('https://google.com');
MainPage.username.setValue('noooooo');
