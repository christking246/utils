const express = require("express");
const router = express.Router();
const service = require("../services/Mht.js");

const { isValidString } = require("../utils");

router
    .post("/", async (req, res) => {
        if (!isValidString(req.body.contents)) {
            return res.status(400).send({ msg: "mht file is required" });
        }

        const { success, contents, msg } = await service.fixMht(req.body.contents);
        if (success) {
            res.status(200).send({ result: contents });
        } else {
            res.status(500).send({ msg: msg ?? "An error occurred trying to fix the provided mht file" });
        }
    });

module.exports = router;