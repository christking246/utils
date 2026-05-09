const express = require("express");
const router = express.Router();
const service = require("../services/Colors.js");

router
    .post("/extract", async (req, res) => {
        const { image, numColors } = req.body;
        try {
            const { success, colors, code, msg } = await service.getDominantColors(image, numColors);
            if (!success) {
                return res.status(code).send({ msg });
            }
            res.status(code).send({ colors });
        } catch (error) {
            res.status(500).send({ msg: error.message ?? "An error occurred while extracting dominant colors" });
        }
    });

module.exports = router;