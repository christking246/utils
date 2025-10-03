const express = require("express");
const router = express.Router();
const service = require("../services/JwtDecoder.js");

const { isValidString } = require("../utils");

router
    .post("/decode", (req, res) => {
        if (!isValidString(req.body.token)) {
            return res.status(400).send({ msg: "invalid token string provided" });
        }

        const { success, payload, header, msg } = service.decodeJwt(req.body.token);
        if (success) {
            res.status(200).send({ payload, header });
        } else {
            res.status(500).send({ msg: "An error occurred trying decode the provided token: " + msg });
        }
    });

module.exports = router;