import { setValue } from '@wdio/shared-store-service';
import HomePage from '#po/home';

export const config = {
    specs: [
        './test/specs/suite1/*.js',
    ],
    suites: {
        s1: ['./test/specs/suite1/*.test.js'],
        s2: ['./test/specs/suite2/*.test.js'],
        s3: ['./test/specs/suite3/*.test.js'],
    },
    maxInstances: 10,
    capabilities: [
        {
            browserName: 'chrome',
            'goog:platformName': 'desktop',
            'goog:customStuff': 'pageObjects',
            exclude: [
                './test/specs/**/*mobile*.js'
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
            exclude: [
                './test/specs/**/*desktop*.js'
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
        }
    ],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
