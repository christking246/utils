const crypto = require('crypto');

module.exports.generateHashes = (str) => {
    try {
        return {
            success: true,
            hashes: {
                "SHA1": crypto.hash('sha1', str),
                "SHA256": crypto.hash('sha256', str),
                "SHA512": crypto.hash('sha512', str),
                "MD5": crypto.hash('md5', str)
            }
        }
    } catch (error) {
        return { success: false, msg: error.message };
    }
};