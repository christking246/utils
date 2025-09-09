const express = require("express");
const router = express.Router();
const service = require("../services/HashGenerator.js");

const { isValidString } = require("../utils");

router
    .post("/", async (req, res) => {
        if (!isValidString(req.body.text)) {
            // technically whitespace can be hashed, but we don't do that here
            return res.status(400).send({ msg: "invalid string provided" });
        }

        const { success, hashes, msg } = await service.generateHashes(req.body.text);
        if (success) {
            res.status(200).send({ hashes });
        } else {
            res.status(500).send({ msg: msg ?? "An error occurred trying generate hashes for the provided text" });
        }
    });

module.exports = router;