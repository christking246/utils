const express = require("express");
const router = express.Router();
const service = require("../services/SvgMinimizer.js");

router
    .post("/optimize", (req, res) => {
        const { success, msg, code, optimizedSvg, diff } = service.optimizeSvg(req.body);
        if (success) {
            res.status(200).send({ optimizedSvg, removedCharCount: diff });
        } else {
            res.status(code).send({ msg: "An error occurred trying to optimize the svg: " + msg });
        }
    });

module.exports = router;