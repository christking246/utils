const express = require("express");
const router = express.Router();
const service = require("../services/CompareImage.js");

router
    .post("/diff", async (req, res) => {
        const { img1, img2, threshold, resize } = req.body;
        const { success, code, msg, percent, imageDiff, threshold: usedThreshold } =
            await service.compareImage(img1, img2, threshold, resize);
        if (success) {
            res.status(code).send({ percent, imageDiff, threshold: usedThreshold });
        } else {
            res.status(code).send({ msg: msg });
        }
    });

module.exports = router;