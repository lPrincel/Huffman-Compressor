const express = require("express")
const compressionRoute = require("./routes/compressionRoutes");
const decompressionRoute = require("./routes/decompressionRoutes");
const comparisionRoute = require("./routes/comparisonRoutes");
const historyRoute = require("./routes/historyRoutes")
const cors = require("cors")
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    exposedHeaders: [
        "Content-Disposition",
        "X-Original-Size",
        "X-Compressed-Size"
    ]
}));

app.get("/api/health",(req,res)=>{
    res.json({
        message: "Huffman compressor API is running"
    });
});

app.use("/api",compressionRoute);
app.use("/api",decompressionRoute)
app.use("/api",comparisionRoute);
app.use("/api",historyRoute);

app.use((error, req, res, next)=>{
    console.log(error);

    if(error.code === "LIMIT_FILE_SIZE"){
        return res.status(413).json({
            message: "File is too large. Maximum allowed size is 150 MB"
        })
    }

    return res.status(400).json({
        message: error.message || "Request failed"
    });
});


module.exports = app;