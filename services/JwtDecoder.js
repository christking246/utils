const { jwtDecode } = require("jwt-decode");

module.exports.decodeJwt = (token) => {
    try {
        const decodedPayload = jwtDecode(token);
        const decodedHeader = jwtDecode(token, { header: true });
        return {
            success: true,
            payload: decodedPayload,
            header: decodedHeader
        }
    } catch (error) {
        return { success: false, msg: error.message };
    }
};