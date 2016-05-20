describe('login page', function () {

    beforeEach(function() {
        browser.get('http://cloudbook.magentapulse.com/#/login');
    });

    it('Login with role admin', function () {
        // Find page elements
        var userNameField = element(by.model('username'));
        var userPassField = element(by.model('password'));
        var userLoginBtn = element(by.css('.btn-brown'));

        // Fill input fields
        userNameField.sendKeys('rootadmin');
        userPassField.sendKeys('p@ssword');


        // // Click to sign in - waiting for Angular as it is manually bootstrapped.
        userLoginBtn.click().then(function () {
            browser.waitForAngular();
            expect(browser.getCurrentUrl()).toMatch('/clients');
        }, 10000);
    });
    it('Login with role hr', function () {
        // Find page elements
        var userNameField = element(by.model('username'));
        var userPassField = element(by.model('password'));
        var userLoginBtn = element(by.css('.btn-brown'));

        // Fill input fields
        userNameField.sendKeys('test123456');
        userPassField.sendKeys('123456');


        // // Click to sign in - waiting for Angular as it is manually bootstrapped.
        userLoginBtn.click().then(function () {
            browser.waitForAngular();
            expect(browser.getCurrentUrl()).toMatch('/info');
        }, 10000);
    });
    it('Login with role normal:can not login', function () {
        // Find page elements
        var userNameField = element(by.model('username'));
        var userPassField = element(by.model('password'));
        var userLoginBtn = element(by.css('.btn-brown'));

        // Fill input fields
        userNameField.sendKeys('usertest123456');
        userPassField.sendKeys('123456');


        // // Click to sign in - waiting for Angular as it is manually bootstrapped.
        userLoginBtn.click().then(function () {
            browser.waitForAngular();
            expect(browser.getCurrentUrl()).toMatch('/login');
        }, 10000);
    });
});