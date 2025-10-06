const express = require("express");
const router = express.Router();
const service = require("../services/Serialization.js");

// TODO: when we start to support more formats, we should make the 2nd param as a var
router
    .post("/json/yml", (req, res) => {
        const { success, code, ymlString, msg } = service.jsonToYml(req.body.json);
        if (success) {
            res.status(code).send({ ymlString });
        } else {
            res.status(code).send({ msg: msg ?? "An error occurred trying convert json to ymlString" });
        }
    })
    .post("/yml/json", (req, res) => {
        const { success, code, json, msg } = service.YmlToJson(req.body.yml);
        if (success) {
            res.status(code).send({ json });
        } else {
            res.status(code).send({ msg: msg ?? "An error occurred trying convert yml to json" });
        }
    });

module.exports = router;