export function formatBytes(bytes){
  if(bytes === 0) return "0 B";

  const units = ["B","KB","MB","GB"];

  const unitIdx = Math.floor(Math.log(bytes)/Math.log(1024));

  return `${(bytes/1024**unitIdx).toFixed(2)} ${units[unitIdx]}`;
}

export function getCompressionMessage(originalSize, compressedSize){
  if(originalSize===0){
    return "Empty files cannot be compressed further.";
  }

  const difference = originalSize-compressedSize;
  
  const percentage = Math.abs((difference/originalSize)*100).toFixed(1);

  if(difference > 0){
    return `Saved ${formatBytes(Math.abs(difference))} (${percentage}%).`;
  }

  if(difference < 0){
    return `File grew by ${formatBytes(Math.abs(difference))} (${percentage}%).`
  }

 return "File size did not change."
}

export async function getErrorMessage(requestError){
  const fallback = "Something went wrong. Ensure the backend server is running."

  if(!requestError.response){
    return fallback;
  }

  const responseData = requestError.response.data;

  if(responseData instanceof Blob){
    const text = await responseData.text();

    try{
      const parsedData = JSON.parse(text);
      return parsedData.message || fallback;
    } catch {
      return text || fallback;
    }
  }

  return responseData?.message || fallback;
}

export function downloadResponse(response) {
  const url = URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = url;

  const disposition = response.headers["content-disposition"];
  const filenameMatch = disposition?.match(/filename="(.+)"/);

  link.download = filenameMatch?.[1] || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

