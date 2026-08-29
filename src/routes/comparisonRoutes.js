const express = require("express");
const path = require("node:path");

const upload = require("../middleware/upload")

const {compareAlgorithms} = require("../services/comparisonService");
const CompressionHistory = require("../models/CompressionHistory")

const router = express.Router();

router.post("/compare",upload.single("file"),async (req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                message: "Please upload a file using the field name 'file'"
            });
        }
        const fileName = path.basename(req.file.originalname);
        const comparison = compareAlgorithms(req.file.buffer, fileName);

        const historyRecord = await CompressionHistory.create({
            fileName,
            originalSize: comparison.originalSize,
            huffmanSize: comparison.huffman.compressedSize,
            rleSize: comparison.rle.compressedSize,
            recommendedAlgorithm: comparison.recommendedAlgorithm
        })
    
        return res.status(201).json({
            ...comparison,
            historyId: historyRecord._id
        })
    } catch(error){
        next(error);
    }
})

module.exports = router;