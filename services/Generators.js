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

// adapted from
// https://github.com/JabbR/JabbR/blob/eb5b4e2f1e5bdbb1ea91230f1884716170a6976d/JabbR/Chat.utility.js#L50
const generateId = () => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

module.exports.generateGuid = (count) => {
    return {
        success: true,
        guids: Array.from({ length: count }, () => generateId())
    }
};

// export for unit testing
module.exports = {
    ...module.exports,
    generateId
};