const { homedir } = require('os');
const headlessCapability = process.env.ENABLE_HEADLESS ? ['--headless=new'] : [];
const chromeVersion = '149.0.7827.53';
// make sure the local paths are correct after download from https://googlechromelabs.github.io/chrome-for-testing/#stable
const chromeBinPath = `${homedir()}/.cache/chrome-for-testing/${chromeVersion}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const chromeDriverBinPath = `${homedir()}/.cache/chrome-for-testing/${chromeVersion}/chromedriver-mac-arm64/chromedriver`;
// const chromeBinPath = '/opt/chrome-linux64/chrome';
// const chromeDriverBinPath = '/opt/chromedriver-linux64/chromedriver';

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
            browserVersion: chromeVersion,
            browserName: 'chrome',
            'wdio:enforceWebDriverClassic': true,
            'wdio:chromedriverOptions': {
                binary: chromeDriverBinPath,
            },
            'goog:platformName': 'desktop',
            'wdio:exclude': [
                './test/specs/**/*mobile*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                binary: chromeBinPath,
                args: [
                    '--no-sandbox',
                    '--disable-oopr-debug-crash-dump',
                    '--noerrdialogs',
                    '--disable-breakpad',
                    '--window-position=1050,210',
                    '--window-size=1366,768',
                    '--disable-gpu',
                    ...headlessCapability
                ],
            },
        },
        {
            browserVersion: chromeVersion,
            browserName: 'chrome',
            'wdio:enforceWebDriverClassic': true,
            'wdio:chromedriverOptions': {
                binary: chromeDriverBinPath,
            },
            'goog:platformName': 'mobile',
            'wdio:exclude': [
                './test/specs/**/*desktop*.js'
            ],
            'goog:loggingPrefs': { browser: 'WARNING' },
            'goog:chromeOptions': {
                binary: chromeBinPath,
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
        timeout: 240000
    },
};
