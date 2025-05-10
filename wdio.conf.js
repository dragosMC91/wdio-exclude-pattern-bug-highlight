const headlessCapability = process.env.ENABLE_HEADLESS ? ['--headless=new'] : [];

exports.config = {
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
            'wdio:enforceWebDriverClassic': true,
            'goog:platformName': 'desktop',
            'wdio:exclude': [
                './test/specs/**/*mobile*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                args: [
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-position=1050,210',
                    '--window-size=1366,768',
                    ...headlessCapability
                ],
            },
        },
        {
            browserName: 'chrome',
            'wdio:enforceWebDriverClassic': true,
            'goog:platformName': 'mobile',
            'wdio:exclude': [
                './test/specs/**/*desktop*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                mobileEmulation: {
                    deviceName: 'iPhone 8',
                },
                args: [
                    ...headlessCapability,
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
    logLevel: process.env.DEBUG ? 'debug' : 'warn',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: [],

    mochaOpts: {
        ui: 'bdd',
        timeout: 180000
    },
}
