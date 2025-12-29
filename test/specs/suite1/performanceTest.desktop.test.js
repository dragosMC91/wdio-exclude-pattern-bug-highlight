/**
 * WebDriverIO Command Performance Test
 * 
 * Measures execution time, CPU usage, and memory consumption for core WebDriverIO commands:
 * - $() - Element finding
 * - .click() - Click action
 * - .isDisplayed() - Visibility check
 * 
 * 
 * Use this test to detect performance regressions from:
 * - Node.js version updates
 * - Library updates (undici, webdriverio, etc.)
 * - Internal helper changes
 */

const { PerformanceMetrics } = require('../../helpers/performanceMetrics');
const os = require('os');
// Test page and selectors
const cwd = process.cwd();
const MEMORY_SAMPLE_INTERVAL = 10;
const TEST_ITERATIONS = process.env.TEST_ITERATIONS ? parseInt(process.env.TEST_ITERATIONS) : 10000;
// use a static page for the test so we can avoid network latency and other external factors
const TEST_PAGE_PATH = `file://${cwd}/test/test_data/test.html`;
const SELECTORS = {
    BUTTON: '#testButton',
    TEXT_INPUT: '#textInput',
    VISIBLE_ELEMENT: '#visibleElement',
};

describe('WebDriverIO Command Performance Benchmark', function() {
    let metrics;

    before(async function() {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║         WebDriverIO Command Performance Benchmark            ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║  Node.js Version:    ${process.version.padEnd(40)}║`);
        console.log(`║  CPU model:          ${(os.cpus()[0].model || 'Unknown').padEnd(40)}║`);
        console.log(`║  Test Iterations:    ${String(TEST_ITERATIONS).padEnd(40)}║`);
        console.log(`║  Memory Sample Rate: Every ${String(MEMORY_SAMPLE_INTERVAL).padEnd(34)}║`);
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('\n');

        await browser.url(TEST_PAGE_PATH);
        
        const title = await browser.getTitle();
        console.log(`Test page loaded: "${title}"\n`);
        // TODO: maybe add a warmup phase here to eliminate cold-start variance before benchmarking
        
        metrics = new PerformanceMetrics({
            memorySampleInterval: MEMORY_SAMPLE_INTERVAL,
        });
    });

    it(`should benchmark ${TEST_ITERATIONS} element find operations`, async function() {
        const selector = SELECTORS.BUTTON;
        console.log(`\nBenchmarking: await $('${selector}')`);
            
        await metrics.runBenchmark(
            async () => $(selector),
            TEST_ITERATIONS
        );
            
        metrics.logAllResults(`$('${selector}') - Find Element`);
            
        // Basic assertion to ensure test ran correctly
        const stats = metrics.getTimingStats();
        expect(stats.samples).toBe(TEST_ITERATIONS);
    });

    it(`should benchmark ${TEST_ITERATIONS} click operations`, async function() {
        const selector = SELECTORS.BUTTON;
        console.log('\nBenchmarking: await button.click()');
        console.log(`Selector: ${selector}`);
            
        // Get element reference once (we're testing click, not find)
        const button = await $(selector);
            
        await metrics.runBenchmark(
            async () => button.click(),
            TEST_ITERATIONS
        );
            
        metrics.logAllResults('button.click() - Click Action');
            
        const stats = metrics.getTimingStats();
        expect(stats.samples).toBe(TEST_ITERATIONS);
    });

    it(`should benchmark ${TEST_ITERATIONS} isDisplayed operations`, async function() {
        const selector = SELECTORS.VISIBLE_ELEMENT;
        console.log('\nBenchmarking: await element.isDisplayed()');
        console.log(`Selector: ${selector}`);
            
        // Get element reference once (we're testing isDisplayed, not find)
        const element = await $(selector);
            
        await metrics.runBenchmark(
            async () => element.isDisplayed(),
            TEST_ITERATIONS
        );
            
        metrics.logAllResults('element.isDisplayed() - Visibility Check');
            
        const stats = metrics.getTimingStats();
        expect(stats.samples).toBe(TEST_ITERATIONS);
    });

    after(function() {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║              Performance Benchmark Complete                  ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('\n');
    });
});
