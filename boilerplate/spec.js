process.env.IP = '127.0.0.1';  // Set the location of you running selenium server or chromedriver instance.
process.env.PORT = '4444';  // Set the port your server is listening on. 
const { browser } = require('browserbot3000'); // You can include the browser here or only include it in your page objects reusable methods

let Google = require('./po');  // Add your page object

browser.newChromeSession();
browser.url('http://google.com');
Google.searchBox.setValue('first search term' + '\uE007'); // use a page element directly 
Google.googleSearch('SeleniumHQ'); // or construct reusable methods for repeatable actions
