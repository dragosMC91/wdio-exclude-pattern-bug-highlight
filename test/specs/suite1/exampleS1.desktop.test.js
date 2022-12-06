import {resolvePageObject} from '../../../resolver.js'
// import HomePage from '#po/home';
const HomePage  = (await import(`../../${browser.requestedCapabilities['goog:customStuff']}/home.js`)).default;

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await browser.url("https://www.google.com");
        const PO = await browser.sharedStore.get('*');
        // console.log("🚀 ~ file: exampleS1.desktop.test.js:4 ~ it ~ PO", await PO);
        // console.log("🚀 ~ file: exampleS1.desktop.test.js:4 ~ it ~ POppp", browser.requestedCapabilities['goog:customStuff']);
        console.log("🚀 ~ file: exampleS1.desktop.test.js:4 ~ it ~ PO", resolvePageObject('home'));
        await HomePage.doStuff();
        console.log("Finish!");
        await browser.pause(1000);
    });
});


