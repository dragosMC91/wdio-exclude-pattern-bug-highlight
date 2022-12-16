import HomePage from 'commons/pageObjects/home.js';

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        console.log("---", HomePage.returnStuff());;
        console.log("====1", browser.custom);
        await browser.url("https://www.google.com");
        await browser.pause(1000);
    });
});


