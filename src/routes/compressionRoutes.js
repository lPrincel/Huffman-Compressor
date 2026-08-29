const express = require('express');
const path = require("node:path")

const upload = require("../middleware/upload");
const {compressBuffer} = require("../services/compressionService");
const {compressRleBuffer} = require("../services/rleService");

const router = express.Router();

router.post("/compress",upload.single("file"),(req,res,next)=>{
  try{
    if(!req.file){
      return res.status(400).json({
        message: "Please upload a file using the field name 'file'"
      });
    }

    const originalName = path.basename(req.file.originalname);
    const result = compressBuffer(req.file.buffer,originalName);
    const outputName = `${path.parse(originalName).name}.hfc`

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${outputName}"`,
      "X-Original-Size": String(result.originalSize),
      "X-Compressed-Size": String(result.compressedSize)
    });

    return res.send(result.compressedBuffer);
  }catch(error){
    next(error);
  }
})

router.post("/compress/rle", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file using the field name 'file'"
      });
    }

    const originalName = path.basename(req.file.originalname);

    const result = compressRleBuffer( req.file.buffer, originalName);

    const outputName = `${path.parse(originalName).name}.rle`;

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${outputName}"`,
      "X-Original-Size": String(result.originalSize),
      "X-Compressed-Size": String(result.compressedSize)
    });

    return res.send(result.compressedBuffer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;