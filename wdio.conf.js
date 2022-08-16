exports.config = {
    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [],
    maxInstances: 10,
    capabilities: [
        {
            browserName: 'chrome',
            'goog:platformName': 'desktop',
            exclude: [
                './test/specs/*mobile*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                args: [
                    '--no-sandbox',
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
                './test/specs/*desktop*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                mobileEmulation: {
                    deviceName: 'iPhone 8',
                },
                args: [
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
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['chromedriver'],
    framework: 'mocha',
    reporters: [],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
