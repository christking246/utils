const express = require("express");
const router = express.Router();
const service = require("../services/Generators.js");

const { isValidString, isNumber } = require("../utils.js");

router
    .post("/hash", (req, res) => {
        if (!isValidString(req.body.text)) {
            // technically whitespace can be hashed, but we don't do that here
            return res.status(400).send({ msg: "invalid string provided" });
        }

        const { success, hashes, msg } = service.generateHashes(req.body.text);
        if (success) {
            res.status(200).send({ hashes });
        } else {
            res.status(500).send({ msg: msg ?? "An error occurred trying generate hashes for the provided text" });
        }
    })
    .get("/guid/:count?", (req, res) => {
        const count = isNumber(req.params.count) ? Number(req.params.count) : 10;
        const { success, guids } = service.generateGuid(count);
        if (success) {
            res.status(200).send({ guids });
        } else {
            res.status(500).send({ msg: "An error occurred generating guids" });
        }
    });

module.exports = router;