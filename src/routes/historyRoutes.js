const express = require("express");
const compressionHistoryModel = require("../models/CompressionHistory");

const router = express.Router();

router.get("/history",async (req, res, next)=> {
    try{
        const history = await compressionHistoryModel.find().sort({createdAt: -1}).limit(20);
        
        res.json(history);

    } catch(error){
        next(error);
    }
})

module.exports = router;