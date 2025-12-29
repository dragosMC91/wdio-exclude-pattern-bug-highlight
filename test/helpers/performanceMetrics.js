const { performance } = require('perf_hooks');

/**
 * Performance Metrics Utility for WebDriverIO Command Testing
 * Provides statistical analysis and resource monitoring for performance benchmarks.
 */
class PerformanceMetrics {
    constructor(options = {}) {
        this.timings = [];
        this.heapSamples = [];
        this.rssSamples = [];
        this.cpuStart = null;
        this.cpuEnd = null;
        this.testStartTime = null;
        this.testEndTime = null;
        
        this.config = {
            memorySampleInterval: options.memorySampleInterval || 10,
            enableMemorySampling: options.enableMemorySampling !== false,
            enableCpuTracking: options.enableCpuTracking !== false,
        };
    }

    reset() {
        this.timings = [];
        this.heapSamples = [];
        this.rssSamples = [];
        this.cpuStart = null;
        this.cpuEnd = null;
        this.testStartTime = null;
        this.testEndTime = null;
    }

    /**
     * Start tracking resources (call at beginning of test)
     */
    startTracking() {
        this.reset();
        this.testStartTime = performance.now();
        if (this.config.enableCpuTracking) {
            this.cpuStart = process.cpuUsage();
        }
        // Take initial memory sample
        if (this.config.enableMemorySampling) {
            this.sampleMemory();
        }
    }

    /**
     * Stop tracking resources (call at end of test)
     */
    stopTracking() {
        this.testEndTime = performance.now();
        if (this.config.enableCpuTracking) {
            this.cpuEnd = process.cpuUsage();
        }
        // Take final memory sample
        if (this.config.enableMemorySampling) {
            this.sampleMemory();
        }
    }

    /**
     * Measure execution time of an async operation
     * @param {Function} asyncFn - Async function to measure
     * @param {number} iteration - Current iteration number (for memory sampling)
     * @returns {Promise<*>} - Result of the async function
     */
    async measureAsync(asyncFn, iteration = 0) {
        const startTime = performance.now();
        const result = await asyncFn();
        const endTime = performance.now();
        
        this.timings.push(endTime - startTime);
        
        // Sample memory at configured interval
        if (this.config.enableMemorySampling && 
            iteration % this.config.memorySampleInterval === 0) {
            this.sampleMemory();
        }
        
        return result;
    }

    /**
     * Run benchmark with full metrics collection
     * Handles startTracking, iteration loop with measureAsync, and stopTracking
     * @param {Function} asyncFn - Async function to benchmark
     * @param {number} iterations - Number of test iterations
     */
    async runBenchmark(asyncFn, iterations) {
        console.log(`Running benchmark (${iterations} iterations)...`);
        
        this.startTracking();
        
        for (let i = 0; i < iterations; i++) {
            await this.measureAsync(asyncFn, i);
        }
        
        this.stopTracking();
        
        console.log('Benchmark complete.');
    }

    sampleMemory() {
        const mem = process.memoryUsage();
        this.heapSamples.push(mem.heapUsed);
        this.rssSamples.push(mem.rss);
    }

    // ==================== Statistical Functions ====================

    /**
     * Calculate arithmetic mean/average - heavily affected by outliers
     */
    static mean(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    static stdDev(arr) {
        if (arr.length < 2) return 0;
        const mean = PerformanceMetrics.mean(arr);
        const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (arr.length - 1);
        return Math.sqrt(variance);
    }

    /**
     * Calculate percentile using NIST interpolation method (https://en.wikipedia.org/wiki/Percentile#Calculation_methods)
     * P50 is the median which is the middle value of the sorted array - less affected by outliers
     * @param {number[]} arr - Array of values
     * @param {number} percentile - Percentile to calculate (0-100)
     */
    static percentile(arr, percentile) {
        if (!arr.length || percentile <= 0 || percentile > 100) return 0;
        
        const sortedArr = [...arr].sort((a, b) => a - b);
        const n = sortedArr.length;
        
        if (percentile === 100) return sortedArr[n - 1];
        
        const index = (percentile / 100) * (n - 1);
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;
        
        if (lowerIndex === upperIndex) {
            return sortedArr[lowerIndex];
        }
        
        return sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;
    }

    /**
     * Calculate coefficient of variation (CV) - relative standard deviation
     * Lower CV = more consistent performance, ideally less than 10%
     */
    static coefficientOfVariation(arr) {
        const mean = PerformanceMetrics.mean(arr);
        if (mean === 0) return 0;
        return (PerformanceMetrics.stdDev(arr) / mean) * 100;
    }

    // ==================== Results Generation ====================

    getTimingStats() {
        const timings = this.timings;
        if (!timings.length) {
            return { error: 'No timing data collected' };
        }

        const p25 = PerformanceMetrics.percentile(timings, 25);
        const p75 = PerformanceMetrics.percentile(timings, 75);
        // measurement of statistical dispersion (the middle 50% of the data)
        const iqr = p75 - p25;
        const mean = PerformanceMetrics.mean(timings);

        // IQR-based outlier detection using Tukey's method
        const mildLowerBound = p25 - 1.5 * iqr;
        const mildUpperBound = p75 + 1.5 * iqr;
        const extremeLowerBound = p25 - 3 * iqr;
        const extremeUpperBound = p75 + 3 * iqr;

        // Extreme outliers are outside [Q1 - 3×IQR, Q3 + 3×IQR]
        const extremeOutliers = timings.filter(
            t => t < extremeLowerBound || t > extremeUpperBound
        );

        // Mild outliers are outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] but not extreme
        const mildOutliers = timings.filter(
            t => (t < mildLowerBound || t > mildUpperBound) &&
                 (t >= extremeLowerBound && t <= extremeUpperBound)
        );

        const outlierNormalizedValues = timings.filter(t => t >= mildLowerBound && t <= mildUpperBound);
        const outlierNormalizedMean = PerformanceMetrics.mean(outlierNormalizedValues);

        return {
            samples: timings.length,
            min: Math.min(...timings),
            max: Math.max(...timings),
            mean: mean,
            outlierNormalizedMean: outlierNormalizedMean,
            stdDev: PerformanceMetrics.stdDev(timings),
            cv: PerformanceMetrics.coefficientOfVariation(timings),
            opsPerSec: mean > 0 ? 1000 / mean : 0,
            outlierNormalizedOpsPerSec: outlierNormalizedMean > 0 ? 1000 / outlierNormalizedMean : 0,
            p25: p25,
            p50: PerformanceMetrics.percentile(timings, 50), // Median
            p75: p75,
            p90: PerformanceMetrics.percentile(timings, 90),
            p95: PerformanceMetrics.percentile(timings, 95),
            p99: PerformanceMetrics.percentile(timings, 99),
            iqr: iqr,
            outliers: {
                mild: {
                    lowerBound: mildLowerBound,
                    upperBound: mildUpperBound,
                    count: mildOutliers.length,
                },
                extreme: {
                    lowerBound: extremeLowerBound,
                    upperBound: extremeUpperBound,
                    count: extremeOutliers.length,
                },
            },
        };
    }

    getCpuStats() {
        if (!this.cpuStart || !this.cpuEnd) {
            return { error: 'CPU tracking not enabled or test not completed' };
        }

        const userDelta = (this.cpuEnd.user - this.cpuStart.user) / 1000; // microseconds to ms
        const systemDelta = (this.cpuEnd.system - this.cpuStart.system) / 1000;
        const totalTime = this.testEndTime - this.testStartTime;

        return {
            userTimeMs: userDelta,
            systemTimeMs: systemDelta,
            totalCpuTimeMs: userDelta + systemDelta,
            wallClockTimeMs: totalTime,
            cpuUtilization: totalTime > 0 ? ((userDelta + systemDelta) / totalTime) * 100 : 0,
        };
    }

    getMemoryStats() {
        if (!this.heapSamples.length) {
            return { error: 'Memory sampling not enabled or no samples collected' };
        }

        const toMB = (bytes) => bytes / (1024 * 1024);
        const heapStart = this.heapSamples[0];
        const heapEnd = this.heapSamples.at(-1);

        return {
            samples: this.heapSamples.length,
            heap: {
                startMB: toMB(heapStart),
                endMB: toMB(heapEnd),
                deltaMB: toMB(heapEnd - heapStart),
                minMB: toMB(Math.min(...this.heapSamples)),
                maxMB: toMB(Math.max(...this.heapSamples)),
                meanMB: toMB(PerformanceMetrics.mean(this.heapSamples)),
                p95MB: toMB(PerformanceMetrics.percentile(this.heapSamples, 95)),
            },
            // total physical memory used by the process (includes heap and stack)
            rss: {
                minMB: toMB(Math.min(...this.rssSamples)),
                maxMB: toMB(Math.max(...this.rssSamples)),
                meanMB: toMB(PerformanceMetrics.mean(this.rssSamples)),
                p95MB: toMB(PerformanceMetrics.percentile(this.rssSamples, 95)),
            },
        };
    }

    // ==================== Console Logging ====================

    /**
     * Format number to fixed decimal places
     */
    static fmt(num, decimals = 2) {
        return num.toFixed(decimals);
    }

    // TODO also show a distribution ascii histogram of the timings with 10 bins something like Distribution (10 bins): 2.8ms ┤████████████████████  (60) 3.6ms ┤█████                 (15) etc ? 
    logTimingResults(label = 'Timing Results') {
        const stats = this.getTimingStats();
        if (stats.error) {
            console.log(`\n--- ${label} ---`);
            console.log(stats.error);
            return;
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`  ${label} (${stats.samples} samples)`);
        console.log(`${'='.repeat(60)}`);
        console.log('  --- CORE METRICS ---');
        console.log(`  RPS:               ${PerformanceMetrics.fmt(stats.opsPerSec)} ops/sec`);
        console.log(`  RPS (normalized):  ${PerformanceMetrics.fmt(stats.outlierNormalizedOpsPerSec)} ops/sec`);
        console.log(`  Mean:              ${PerformanceMetrics.fmt(stats.mean)} ms`);
        console.log(`  Mean (normalized): ${PerformanceMetrics.fmt(stats.outlierNormalizedMean)} ms`);
        console.log(`  P50 (Median):      ${PerformanceMetrics.fmt(stats.p50)} ms`);
        console.log(`  P75:               ${PerformanceMetrics.fmt(stats.p75)} ms`);
        console.log(`  P90:               ${PerformanceMetrics.fmt(stats.p90)} ms`);
        console.log(`  P95:               ${PerformanceMetrics.fmt(stats.p95)} ms`);
        console.log('  --- STABILITY & SPREAD ---');
        console.log(`  Min / Max:         ${PerformanceMetrics.fmt(stats.min)} ms / ${PerformanceMetrics.fmt(stats.max)} ms`);
        console.log(`  Std Dev:           ${PerformanceMetrics.fmt(stats.stdDev)} ms`);
        console.log(`  CV:                ${PerformanceMetrics.fmt(stats.cv, 2)}% (lower = more consistent)`);
        console.log(`  IQR:               ${PerformanceMetrics.fmt(stats.iqr)} ms`);
        console.log(`  Mild Outliers:     ${stats.outliers.mild.count} (outside [${PerformanceMetrics.fmt(stats.outliers.mild.lowerBound)} ms, ${PerformanceMetrics.fmt(stats.outliers.mild.upperBound)} ms])`);
        console.log(`  Extreme Outliers:  ${stats.outliers.extreme.count} (outside [${PerformanceMetrics.fmt(stats.outliers.extreme.lowerBound)} ms, ${PerformanceMetrics.fmt(stats.outliers.extreme.upperBound)} ms])`);
        console.log(`${'='.repeat(60)}\n`);
    }

    logCpuResults() {
        const stats = this.getCpuStats();
        if (stats.error) {
            console.log('\n--- CPU Usage ---');
            console.log(stats.error);
            return;
        }

        console.log('\n--- CPU Usage (Node.js Process) ---');
        console.log(`  User Time:       ${PerformanceMetrics.fmt(stats.userTimeMs, 2)} ms`);
        console.log(`  System Time:     ${PerformanceMetrics.fmt(stats.systemTimeMs, 2)} ms`);
        console.log(`  Total CPU Time:  ${PerformanceMetrics.fmt(stats.totalCpuTimeMs, 2)} ms`);
        console.log(`  Wall Clock Time: ${PerformanceMetrics.fmt(stats.wallClockTimeMs, 2)} ms`);
        console.log(`  CPU Utilization: ${PerformanceMetrics.fmt(stats.cpuUtilization, 2)}%`);
        console.log('-----------------------------------\n');
    }

    logMemoryResults() {
        const stats = this.getMemoryStats();
        if (stats.error) {
            console.log('\n--- Memory Usage ---');
            console.log(stats.error);
            return;
        }

        const { heap, rss } = stats;
        const deltaSign = heap.deltaMB >= 0 ? '+' : '';

        console.log(`\n--- Memory Usage (${stats.samples} samples) ---`);
        console.log('  Heap Used:');
        console.log(`    Start:  ${PerformanceMetrics.fmt(heap.startMB, 2)} MB`);
        console.log(`    End:    ${PerformanceMetrics.fmt(heap.endMB, 2)} MB`);
        console.log(`    Delta:  ${deltaSign}${PerformanceMetrics.fmt(heap.deltaMB, 2)} MB`);
        console.log(`    Min:    ${PerformanceMetrics.fmt(heap.minMB, 2)} MB`);
        console.log(`    Max:    ${PerformanceMetrics.fmt(heap.maxMB, 2)} MB  ← Peak`);
        console.log(`    Mean:   ${PerformanceMetrics.fmt(heap.meanMB, 2)} MB`);
        console.log(`    P95:    ${PerformanceMetrics.fmt(heap.p95MB, 2)} MB`);
        console.log('  RSS (Resident Set Size):');
        console.log(`    Min:    ${PerformanceMetrics.fmt(rss.minMB, 2)} MB`);
        console.log(`    Max:    ${PerformanceMetrics.fmt(rss.maxMB, 2)} MB`);
        console.log(`    Mean:   ${PerformanceMetrics.fmt(rss.meanMB, 2)} MB`);
        console.log(`    P95:    ${PerformanceMetrics.fmt(rss.p95MB, 2)} MB`);
        console.log('----------------------------------------------\n');
    }

    logAllResults(label = 'Performance Results') {
        this.logTimingResults(label);
        this.logCpuResults();
        this.logMemoryResults();
    }
}

module.exports = {
    PerformanceMetrics,
};

