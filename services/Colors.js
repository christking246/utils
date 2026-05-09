const { Jimp } = require('jimp');

const { isDefined, isNumber } = require("../utils");

/**
 * Runs a simple k-means clustering algorithm on pixel data
 * @param {Array} pixels Array of [r,g,b] pixels
 * @param {number} k Number of clusters
 * @param {number} maxIters Maximum iterations
 * @returns {Array} Array of cluster centers (dominant colors)
 */
const kMeans = (pixels, k = 5, maxIters = 10) => {
    // Simple seeded RNG (LCG)
    function seededRandomFactory(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        return function() {
            s = s * 16807 % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    // Always use a fixed seed for determinism
    const seededRandom = seededRandomFactory(42);

    // Deterministically initialize cluster centers
    let centers = [];
    let usedIdx = new Set();
    for (let i = 0; i < k; i++) {
        let idx;
        // Avoid duplicate centers
        do {
            idx = Math.floor(seededRandom() * pixels.length);
        } while (usedIdx.has(idx) && usedIdx.size < pixels.length);
        usedIdx.add(idx);
        centers.push(pixels[idx]);
    }

    let assignments = new Array(pixels.length);
    for (let iter = 0; iter < maxIters; iter++) {
        // Assign pixels to nearest center
        for (let i = 0; i < pixels.length; i++) {
            let minDist = Infinity, idx = 0;
            for (let j = 0; j < k; j++) {
                let dist = euclidean(pixels[i], centers[j]);
                if (dist < minDist) {
                    minDist = dist;
                    idx = j;
                }
            }
            assignments[i] = idx;
        }

        // Update centers
        let sums = Array.from({length: k}, () => [0,0,0]);
        let counts = Array(k).fill(0);
        for (let i = 0; i < pixels.length; i++) {
            let cluster = assignments[i];
            sums[cluster][0] += pixels[i][0];
            sums[cluster][1] += pixels[i][1];
            sums[cluster][2] += pixels[i][2];
            counts[cluster]++;
        }
        for (let j = 0; j < k; j++) {
            if (counts[j] === 0) continue; // Avoid division by zero
            centers[j] = [
                Math.round(sums[j][0] / counts[j]),
                Math.round(sums[j][1] / counts[j]),
                Math.round(sums[j][2] / counts[j])
            ];
        }
    }

    // Sort centers by cluster size (dominance)
    let clusterSizes = Array(k).fill(0);
    for (let i = 0; i < assignments.length; i++) {
        clusterSizes[assignments[i]]++;
    }
    let sorted = centers.map((c, i) => ({color: c, count: clusterSizes[i]}))
        .sort((a, b) => b.count - a.count)
        .map(obj => obj.color);
    return sorted;
}

const euclidean = (a, b) =>
    Math.sqrt(
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2 +
        (a[2] - b[2]) ** 2
    );

/**
 * Get dominant colors from an image file
 * @param {string} image Base64 encoded image
 * @param {number} numColors Number of dominant colors to return
 * @returns {Promise<Array>} Array of dominant colors as [r,g,b]
 */
const getDominantColors = async (image, numColors) => {
    if (!isDefined(image)) {
        return { success: false, code: 400, msg: "Image not provided" };
    }

    if (!isNumber(numColors)) {
        numColors = 5; // default to 5 colors if not provided or invalid
    }

    // if the string has the base64 mime prefix, remove it
    if (image.split(',').length > 1) {
        image = image.split(',')[1];
    }

    const jimpImage = await Jimp.fromBuffer(Buffer.from(image, "base64"));

    // Resize for performance
    if (jimpImage.width > 150) {
        jimpImage.resize({ w: 150 });
    }

    let pixels = [];
    jimpImage.scan(0, 0, jimpImage.bitmap.width, jimpImage.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        pixels.push([r, g, b]);
    });

    // is KMeans clustering really the best algo fir this, with the cluster center initialization etc.
    return { success: true, code: 200, colors: kMeans(pixels, numColors) };
}

module.exports = { getDominantColors };