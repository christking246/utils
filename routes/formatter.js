const express = require("express");
const router = express.Router();
const service = require("../services/Formatter.js");

const { isValidString } = require("../utils.js");

router
    .post("/md-table", (req, res) => {
        if (!isValidString(req.body.table)) {
            return res.status(400).send({ msg: "invalid string provided for markdown table" });
        }

        const { success, table, msg, code } = service.formatMarkdownTable(req.body.table);
        if (success) {
            res.status(200).send({ table });
        } else {
            res.status(code ?? 500).send({ msg: msg ?? "An error occurred trying format the table" });
        }
    })

module.exports = router;