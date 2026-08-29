const express = require("express");

const upload = require("../middleware/upload");
const {decompressBuffer} = require("../services/compressionService");
const {decompressRleBuffer} = require("../services/rleService");

const router = express.Router();

router.post("/decompress",upload.single("file"),(req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                message: "Please upload an .hfc or .rle archive using the field name 'file'"
            })
        }
        const magic = req.file.buffer.subarray(0, 4).toString("ascii");

        let result;

        if (magic === "HFC2") {
            result = decompressBuffer(req.file.buffer);
        } else if (magic === "RLE1") {
            result = decompressRleBuffer(req.file.buffer);
        } else {
            throw new Error(
                "Invalid archive: expected an HFC2 or RLE1 file."
            );
        }

        const { decodedBuffer, fileName } = result;
        
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