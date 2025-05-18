const { performance } = require('perf_hooks');
const cwd = process.cwd();
const dummyHtmlPath = `file://${cwd}/test/test_data/test.html`;

function calculateMean(arr) {
    if (!arr.length) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function calculateStdDev(arr) {
    if (arr.length < 2) return 0; // Need at least 2 points for std dev
    const mean = calculateMean(arr);
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (arr.length -1) ; // sample std dev
    return Math.sqrt(variance);
}

function calculatePercentile(arr, percentile) {
    if (!arr.length || percentile <= 0 || percentile > 100) return 0;
    const sortedArr = [...arr].sort((a, b) => a - b);
    // Calculate the index (using the NIST method, R-7)
    // https://en.wikipedia.org/wiki/Percentile#Calculation_methods
    const n = sortedArr.length;
    if (percentile === 100) return sortedArr[n - 1];

    const index = (percentile / 100) * (n - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;

    if (lowerIndex === upperIndex) {
        return sortedArr[lowerIndex];
    } else {
        // Interpolate between the two closest values
        return sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;
    }
}

function logResults(timings) {
    const stdDev = calculateStdDev(timings);
    const min = Math.min(...timings);
    const max = Math.max(...timings);
    const p25 = calculatePercentile(timings, 25);
    const p50 = calculatePercentile(timings, 50); // Median
    const p90 = calculatePercentile(timings, 90);
    const p95 = calculatePercentile(timings, 95);
    const p75 = calculatePercentile(timings, 75);
    // Interquartile Range (IQR): The difference between P75 and P25 (IQR = P75 - P25).
    // This measures the spread of the middle 50% of the data, 
    // giving a sense of variability without being affected by extreme outliers.
    const iqr = p75 - p25;
    console.log(`\n--- Request Timings Results (${timings.length} samples) ---`);
    console.log(`P50:    ${p50.toFixed(3)} ms (Median)`);
    console.log(`P75:    ${p75.toFixed(3)} ms`);
    console.log(`P90:    ${p90.toFixed(3)} ms`);
    console.log(`P95:    ${p95.toFixed(3)} ms`);
    console.log(`IQR:    ${iqr.toFixed(3)} ms`);
    console.log(`StdDev: ${stdDev.toFixed(3)} ms`); // Lower is more consistent
    console.log(`Min:    ${min.toFixed(3)} ms`);
    console.log(`Max:    ${max.toFixed(3)} ms`);
    console.log(`------------------------------------\n`);
}

describe('Validate agent reuse performance boost', () => {
    const WARMUP_ITERATIONS = 50; // Number of initial requests to discard
    const TEST_ITERATIONS = 1000; // Number of requests to measure
    const ELEMENT_SELECTOR = '#testButton'; // Selector for the target element

    before(async () => {
        console.log(`\n--- Performance Test ---`);
        await browser.url(dummyHtmlPath);
        console.log('Starting warm-up phase...');
        for (let i = 0; i < WARMUP_ITERATIONS; i++) {
            await $(ELEMENT_SELECTOR);
        }
        console.log('Warm-up complete. Starting measurement phase...');
    });

    beforeEach(() => {
        // Reset timings before each test (each `it` block measures different things)
        timings = [];
    });

    it(`should measure performance of ${TEST_ITERATIONS} element find requests`, async () => {
        console.log(`Selector: ${ELEMENT_SELECTOR} find test`);
        console.log(`Test Iterations: ${TEST_ITERATIONS}`);
        for (let i = 0; i < TEST_ITERATIONS; i++) {
            const startTime = performance.now();
            await $(ELEMENT_SELECTOR);
            const endTime = performance.now();
            timings.push(endTime - startTime);
        }
        console.log('Measurement complete.');

        expect(timings.length).toBe(TEST_ITERATIONS);
        logResults(timings)

        // expect(calculateMedian(timings)).toBeLessThan(50);
    });

    it(`should measure performance of ${TEST_ITERATIONS} element click requests`, async () => {
        console.log(`Selector: ${ELEMENT_SELECTOR} click test`);
        console.log(`Test Iterations: ${TEST_ITERATIONS}`);
        const button = await $(ELEMENT_SELECTOR);
        for (let i = 0; i < TEST_ITERATIONS; i++) {
            const startTime = performance.now();
            await button.click();
            const endTime = performance.now();
            timings.push(endTime - startTime);
        }
        console.log('Measurement complete.');

        expect(timings.length).toBe(TEST_ITERATIONS);
        logResults(timings)
    });

    it(`should measure performance of ${TEST_ITERATIONS} element isDisplayed actions`, async () => {
        console.log(`Selector: ${ELEMENT_SELECTOR} isDisplayed test`);
        console.log(`Test Iterations: ${TEST_ITERATIONS}`);
        const button = await $(ELEMENT_SELECTOR);
        for (let i = 0; i < TEST_ITERATIONS; i++) {
            const startTime = performance.now();
            await button.isDisplayed();
            const endTime = performance.now();
            timings.push(endTime - startTime);
        }
        console.log('Measurement complete.');

        expect(timings.length).toBe(TEST_ITERATIONS);
        logResults(timings)
    });
});
