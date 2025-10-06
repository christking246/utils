const express = require("express");
const router = express.Router();
const service = require("../services/Cron.js");

router
    .post("/describe", (req, res) => {
        const { success, code, description, msg } = service.describeCron(req.body.expression);
        if (success) {
            res.status(code).send({ description });
        } else {
            res.status(code).send({ msg: msg ?? "An error occurred trying convert json to ymlString" });
        }
    });

module.exports = router;