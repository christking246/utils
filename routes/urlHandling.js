const express = require("express");
const router = express.Router();
const service = require("../services/UrlHandling.js");

const { isValidString } = require("../utils.js");

router
    .post("/encode", (req, res) => {
        if (!isValidString(req.body.url)) {
            return res.status(400).send({ msg: "invalid url string provided" });
        }

        const { success, encodedUrl, msg } = service.encodeUrl(req.body.url);
        if (success) {
            res.status(200).send({ encodedUrl });
        } else {
            res.status(500).send({ msg: msg ?? "An error occurred trying encode the url" });
        }
    })
    .post("/decode", (req, res) => {
        if (!isValidString(req.body.url)) {
            return res.status(400).send({ msg: "invalid url string provided" });
        }

        const { success, decodedUrl, msg } = service.decodeUrl(req.body.url);
        if (success) {
            res.status(200).send({ decodedUrl });
        } else {
            res.status(500).send({ msg: msg ?? "An error occurred trying encode the url" });
        }
    })
    .post("/parse", (req, res) => {
        if (!isValidString(req.body.url)) {
            return res.status(400).send({ msg: "invalid url string provided" });
        }

        const { success, msg, code, ...parts } = service.parseUrl(req.body.url);
        if (success) {
            res.status(code).send(parts);
        } else {
            res.status(code).send({ msg: msg ?? "An error occurred trying parse the url" });
        }
    })

module.exports = router;