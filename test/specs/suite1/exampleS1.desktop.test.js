import HomePage from '#po/home';

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await browser.url("https://www.google.com");
        const PO = await browser.sharedStore.get('*');
        console.log("🚀 ~ file: exampleS1.desktop.test.js:4 ~ it ~ PO", await PO);
        await HomePage.doStuff();
        console.log("Finish!");
        await browser.pause(1000);
    });
});


