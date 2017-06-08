const { browser, Page } = require('./index');
module.exports = {

	// Main Login
	username: new Page.Element('input[id="username"]'),
	password: new Page.Element('input[id="password"]'),
	signinButton: new Page.Element('button[id="signInButton"]'),

	login: function(username, password) {
		browser.url('google.com');
		this.username.setValue(username);
		this.password.setValue(password);
		this.signinButton.click();
	}

};