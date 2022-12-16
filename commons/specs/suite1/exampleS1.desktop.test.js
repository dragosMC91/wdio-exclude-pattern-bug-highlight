// const { getPageObjects } = require("resolver.js");
import { getPageObjects, resolvePageObject,  } from '#e2e/resolver';
import { checkCaching } from '#e2e/resolver';
// const { AppPages } = (await import(`#e2e/${browser.requestedCapabilities['goog:customStuff']}/appPages`));
// const { HomePage, SearchPage } = AppPages[browser.requestedCapabilities['goog:platformName']];
const { HomePage, SearchPage } = getPageObjects();

// const cv = await checkCaching();
// const HomePage  = (await import(`../../${browser.requestedCapabilities['goog:customStuff']}/home.js`)).default;

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await browser.url("https://www.google.com");
        const PO = await browser.sharedStore.get('*');
        console.log("🚀 ~ file: exampleS1.desktop.test.js:4 ~ it ~ PO", await PO);
        await HomePage.doStuff();
        await SearchPage.doSearchStuff();
        console.log("Finish0!", browser.customThing);
        console.log("Finish1!", resolvePageObject('home.js'));
        console.log("Finish1!", HomePage.returnStuff());
        console.log("Finish2!", SearchPage.returnSearchStuff());
        // console.log("Finish2!", AppPages);
        // console.log("Finish3!", AppPages);
        // console.log("Finish3!", thing2);
        await browser.pause(1000);
    });
});


