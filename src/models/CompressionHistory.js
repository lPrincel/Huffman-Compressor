const mongoose = require("mongoose");

const compressionHistorySchema = new mongoose.Schema(
    {
        fileName:{
            type: String,
            required: true,
            trim: true
        },
        originalSize:{
            type: Number,
            required: true,
            min: 0
        },
        huffmanSize: {
            type: Number,
            required: true,
            min: 0
        },
        rleSize: {
            type: Number,
            required: true,
            min: 0
        },
        recommendedAlgorithm: {
            type: String,
            required: true,
            enum: ["huffman", "rle", "tie"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CompressionHistory",
    compressionHistorySchema
)