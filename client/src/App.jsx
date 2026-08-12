import {useState} from "react"
import axios from "axios"

function App() {
  const [mode,setMode] = useState("compress");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const isCompressMode = mode === "compress";

  function handleFileChange(event){
    const file = event.target.files[0] || null;
    if(!isCompressMode && !file.name.endsWith(".hfc")){
      alert("Invalid file type. Please upload an .hfc file.");
      event.target.value = "";
      return;
    }
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

      const endpoint = isCompressMode ? "http://localhost:5000/api/compress"
      : "http://localhost:5000/api/decompress";

      const response = await axios.post(endpoint, formData,{
        responseType: "blob"
      })
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url; 

      const disposition = response.headers["content-disposition"];
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      link.download = filenameMatch?.[1] || "download";

      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError){
      const message = requestError.response?.data?.message || 
      "Something went wrong. Ensure the backend server is running.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <section className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Huffman Compressor</h1>

        <p className="mt-2 text-slate-600">
          compress files loselessly or restore an existing HFC archive.
        </p>
        <div className="mt-8 flex rounded-lg bg-slate-200">
          <button 
            type="button"
            onClick={() =>{ setMode("compress"); setSelectedFile(null)}}
            className={`flex-1 rounded-md px-4 py-2 font-medium transition ${
              isCompressMode ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-300"
            }`}
          >Compress</button>
          <button
            type="button"
            onClick={()=> {setMode("decompress"); setSelectedFile(null)}}
            className={`flex-1 rounded-md px-4 py-2 font-medium transition ${
              !isCompressMode ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-300"
            }`}
          >Decompress</button>
        </div>
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            {isCompressMode ? "Compress a file": "Decompress an HFC archive"}
          </h2>

          <p className="mt-2 text-slate-600">
            Current mode: <strong>{mode}</strong>
          </p>
          <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50">
            <span className="block font-medium">
              {selectedFile ? selectedFile.name : "Choose a file"}
            </span>
            <span>{selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB`: isCompressMode ? "Upload a text, CSV, JSON, or other file up to 20 MB." : "Upload an HFC archive (.hfc) up to 20 MB."}</span>
            <input type="file" accept={isCompressMode ? undefined : ".hfc"} onChange={handleFileChange} className="hidden"/>
          </label>
          <button type="button" onClick={handleSubmit} disabled={!selectedFile || isLoading}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >{isLoading ? "Processing..." : isCompressMode ? "Compress and download" : "Decompress and download"}
          </button>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default App