import {useState} from "react"
import axios from "axios"

import {formatBytes, getCompressionMessage, getErrorMessage, downloadResponse} from "./utils/helper";
import HistoryView from "./component/HistoryView";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [mode,setMode] = useState("compress");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [decompressionResult, setDecompressionResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const isCompressMode = mode === "compress";
  const isDecompressMode = mode === "decompress";
  
  async function fetchHistory(){
    try{
      const response = await axios.get(`${API_BASE_URL}/api/history`);
      setHistory(response.data);
    } catch(err){
      console.error("Failed to load history", err);
    }
  }

  function handleFileChange(event){
    const file = event.target.files[0] || null;

    if(!file){
      setSelectedFile(null);
      setDecompressionResult(null);
      setComparisonResult(null);
      return;
    }

    const lowerFileName = file.name.toLowerCase();

    if (
      isDecompressMode &&
      !lowerFileName.endsWith(".hfc") &&
      !lowerFileName.endsWith(".rle")
    ) {
      alert("Invalid file type. Please upload an .hfc or .rle archive.");
      event.target.value = "";
      return;
    }

    setError("");
    setDecompressionResult(null);
    setComparisonResult(null);
    setSelectedFile(file);
  }

  async function handleSubmit(){
    if(!selectedFile){
      setError("Choose a file first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try{
      const formData = new FormData();
      formData.append("file",selectedFile);

      const endpoint = isCompressMode ? `${API_BASE_URL}/api/compare` : `${API_BASE_URL}/api/decompress`;

      const response = await axios.post(
        endpoint,
        formData,
        isCompressMode ? {} : { responseType: "blob" }
      );

      if(isCompressMode){
        setComparisonResult(response.data);
        return;
      }

      setDecompressionResult({
        restoredSize : response.data.size,
        compressedSize : selectedFile.size
      });

      downloadResponse(response);

    } catch (requestError){
      const message = await getErrorMessage(requestError);
      setError(message);

    } finally {
      setIsLoading(false);
    }
  }

  async function handleAlgorithmDownload(algorithm) {
    if (!selectedFile) {
      setError("Choose a file first.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const endpoint =
        algorithm === "huffman"
          ? `${API_BASE_URL}/api/compress`
          : `${API_BASE_URL}/api/compress/rle`;

      const response = await axios.post(endpoint, formData, {
        responseType: "blob"
      });

      downloadResponse(response);
    } catch (requestError) {
      const message = await getErrorMessage(requestError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 font-sans selection:bg-blue-500/30">

      <section className="mx-auto max-w-2xl mt-12">

        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">File Compressor</h1>

        <p className="mt-2 text-zinc-400">
          Compare lossless Huffman and RLE compression, then restore either archive.
        </p>

        <div className="mt-8 flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">

          <button 
            type="button"
            onClick={() =>{setMode("compress"); setSelectedFile(null); setComparisonResult(null); setDecompressionResult(null); setHistory([])}}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 ${
              isCompressMode ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >Compress</button>

          <button
            type="button"
            onClick={()=> {setMode("decompress"); setSelectedFile(null); setComparisonResult(null); setDecompressionResult(null); setHistory([])}}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 ${
              isDecompressMode ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >Decompress</button>

          <button
            type="button"
            onClick={()=> {setMode("history"); setSelectedFile(null); setComparisonResult(null); setDecompressionResult(null); fetchHistory();}}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 ${
              mode === "history" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >History</button>

        </div>

        {mode !== "history" && (
          <div className="mt-6 rounded-2xl bg-zinc-900 p-6 sm:p-8 border border-zinc-800 shadow-2xl">

          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            {isCompressMode
              ? "Compress a file"
              : "Decompress an archive"}
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {isCompressMode
              ? "Analyze both algorithms, then choose the archive you want to download."
              : "Restore an HFC or RLE archive losslessly."}
          </p>

          <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/50 p-10 text-center transition-colors hover:border-zinc-500 hover:bg-zinc-900">

            <span className="block font-medium text-zinc-200">
              {selectedFile ? selectedFile.name : "Choose a file to upload"}
            </span>

            <span className="mt-2 block text-sm text-zinc-500">
              {selectedFile
                ? formatBytes(selectedFile.size)
                : isDecompressMode
                  ? "Upload an HFC or RLE archive (.hfc or .rle)"
                  : "Upload a text, CSV, JSON, or other file up to 150 MB"}
            </span>

            <input type="file" accept={isDecompressMode ? ".hfc,.rle" : undefined} onChange={handleFileChange} className="hidden"/>

          </label>

          <button type="button" onClick={handleSubmit} disabled={!selectedFile || isLoading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white active:scale-[0.98] disabled:pointer-events-none disabled:bg-zinc-800 disabled:text-zinc-500"
          >{isLoading ? (
            <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-900"></span>
            Processing...
            </>
          ) : (
            isCompressMode
              ? "Analyze compression options"
              : "Decompress and download"
          )}
          </button>

          {decompressionResult && (
            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  Decompression complete
                </p>
              </div>

              <h3 className="mt-3 text-lg font-semibold text-zinc-100">
                Original file restored successfully
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Archive Size</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-100">
                    {formatBytes(decompressionResult.compressedSize)}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Restored Size</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-100">
                    {formatBytes(decompressionResult.restoredSize)}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm text-zinc-400">
                The archive was restored losslessly and downloaded to your device.
              </p>
            </div>
          )}

          {comparisonResult && (
            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
              
              <p className="text-sm font-medium text-zinc-400">
                Analysis Complete
              </p>

              <h3 className="mt-1 text-xl font-bold text-zinc-100">
                Recommended: <span className="text-emerald-400">{comparisonResult.recommendedAlgorithm.toUpperCase()}</span>
              </h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Huffman</p>
                    {comparisonResult.recommendedAlgorithm === "huffman" && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">Best</span>
                    )}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">
                    {formatBytes(comparisonResult.huffman.compressedSize)}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {getCompressionMessage(
                      comparisonResult.originalSize,
                      comparisonResult.huffman.compressedSize
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAlgorithmDownload("huffman")}
                    disabled={isLoading}
                    className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    Download .hfc
                  </button>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">RLE</p>
                    {comparisonResult.recommendedAlgorithm === "rle" && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">Best</span>
                    )}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-zinc-100">
                    {formatBytes(comparisonResult.rle.compressedSize)}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {getCompressionMessage(
                      comparisonResult.originalSize,
                      comparisonResult.rle.compressedSize
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAlgorithmDownload("rle")}
                    disabled={isLoading}
                    className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    Download .rle
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          </div>
        )}
        {mode === "history" && <HistoryView history={history} />} 

      </section>

    </main>
  )
}

export default App
