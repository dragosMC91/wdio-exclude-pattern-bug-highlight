import { setValue } from '@wdio/shared-store-service';
export const config = {
    specs: [
        './specs/**/*.test.js',
        '../commons/specs/**/*.test.js',
    ],
    maxInstances: 1,
    capabilities: [
        {
            browserName: 'chrome',
            'goog:platformName': 'desktop',
            'goog:customStuff': 'pageObjects',
            exclude: [
                './specs/**/*mobile*.js',
                '../commons/specs/**/*mobile*.js',
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                args: [
                    '--no-sandbox',
                    '--headless',
                    '--disable-dev-shm-usage',
                    '--window-position=1050,210',
                    '--window-size=1366,768',
                ],
            },
        },
        {
            browserName: 'chrome',
            'goog:platformName': 'mobile',
            'goog:customStuff': 'pageObjects',
            exclude: [
                './specs/**/*desktop*.js',
                '../commons/specs/**/*desktop*.js',
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                mobileEmulation: {
                    deviceName: 'iPhone 8',
                },
                args: [
                    '--headless',
                    '--window-position=1050,210',
                    'use-mobile-user-agent',
                ],
                prefs: {
                    protocol_handler: {
                        excluded_schemes: {
                            sms: false,
                            tel: false,
                        },
                    },
                },
            },
        },
    ],
    logLevel: 'error',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['chromedriver', 'shared-store'],
    framework: 'mocha',
    reporters: [],
    onPrepare: [
        async function (config, capabilities) {
            await setValue('pageObjects', {
                'key':'val',
                'key2':'val2',
                'key3':'val3',
            })
        },
    ],
    before: async function(caps, specs, browser) {
        browser.custom = "basic wdio conf"
    },


    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
