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
    })
    .post("/translate", (req, res) => {
        const { success, msg, code, ...spans } = service.translateDuration(req.body);
        if (success) {
            res.status(200).send({ success: true, ...spans });
        } else {
            res.status(code).send({ msg: "An error occurred trying translate the time span: " + msg });
        }
    });

module.exports = router;