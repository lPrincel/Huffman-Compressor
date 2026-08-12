const express = require("express");
const path = require("node:path");

const upload = require("../middleware/upload");
const {decompressBuffer} = require("../services/compressionService");

const router = express.Router();

router.post("/decompress",upload.single("file"),(req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                message: "Please upload an .hfc file usingn the field name 'file'"
            })
        }
        const {decodedBuffer,fileName} = decompressBuffer(req.file.buffer);
    
        
        res.set({
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${fileName}"`,
        })
    
        res.send(decodedBuffer);
    }catch(error){
        next(error);
    }
})

module.exports = router;