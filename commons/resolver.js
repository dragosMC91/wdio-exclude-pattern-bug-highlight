import { existsSync } from 'fs';
import { resolve } from 'path';

const { AppPages } = (await import(`#e2e/${browser.requestedCapabilities['goog:customStuff']}/appPages`));

export const resolvePageObject = name => {
    return existsSync(resolve(`test/pageObjects/${name}`));
}

export const getPageObjects = () => {
    return AppPages[browser.requestedCapabilities['goog:platformName']];
}
