const { isDefined } = require("../utils");

module.exports.encodeUrl = (url) => {
    if (!isDefined(url)) {
        return { success: false, code: 400, msg: "No url to encode" };
    }

    try {
        return {
            success: true,
            code: 200,
            encodedUrl: encodeURIComponent(url)
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error encoding the url: " + e.message };
    }
};

module.exports.decodeUrl = (url) => {
    if (!isDefined(url)) {
        return { success: false, code: 400, msg: "No url to decode" };
    }

    try {
        return {
            success: true,
            code: 200,
            decodedUrl: decodeURIComponent(url)
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error decoding the url: " + e.message };
    }
};

module.exports.parseUrl = (url) => {
    if (!isDefined(url)) {
        return { success: false, code: 400, msg: "No url to parse" };
    }

    try {
        const urlObject = new URL(url);
        return {
            success: true,
            code: 200,
            protocol: urlObject.protocol,
            host: urlObject.host,
            pathname: urlObject.pathname,
            searchParams: Object.fromEntries(urlObject.searchParams),
            origin: urlObject.origin,
            port: urlObject.port,
            hash: urlObject.hash
        }
    } catch (e) {
        return { success: false, code: 500, msg: "Error decoding the url: " + e.message };
    }
};