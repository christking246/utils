const express = require("express");
const router = express.Router();
const service = require("../services/TimeConverter.js");

router
    .post("/convert", (req, res) => {
        const { success, msg, code, ...formats } = service.convertTime(req.body);
        if (success) {
            res.status(200).send(formats);
        } else {
            res.status(code).send({ msg: "An error occurred trying parse the provided date: " + msg });
        }
    });

module.exports = router;