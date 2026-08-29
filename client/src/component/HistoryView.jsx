import { formatBytes, getCompressionMessage } from "../utils/helper";

export default function HistoryView({ history }) {
  return (
    <div className="mt-6 rounded-2xl bg-zinc-900 p-6 sm:p-8 border border-zinc-800 shadow-2xl">
      {history.length > 0 ? (
        <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Compression History</h2>
        {history.map((entry) => (
            <div key={entry._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700">

            <div className="flex items-center justify-between">
                <p className="font-medium text-zinc-200">{entry.fileName}</p>
                <p className="text-xs text-zinc-500">
                {new Date(entry.createdAt).toLocaleString()}
                </p>
            </div>

            <p className="mt-3 text-sm text-zinc-400">
                Original: <span className="font-medium text-zinc-300">{formatBytes(entry.originalSize)}</span>
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Huffman</p>
                  <p className="mt-1 font-medium text-zinc-300">{formatBytes(entry.huffmanSize)}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                  {getCompressionMessage(entry.originalSize, entry.huffmanSize)}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">RLE</p>
                  <p className="mt-1 font-medium text-zinc-300">{formatBytes(entry.rleSize)}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                  {getCompressionMessage(entry.originalSize, entry.rleSize)}
                  </p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">BEST ALGORITHM:</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold tracking-wide text-emerald-400">
                  {entry.recommendedAlgorithm.toUpperCase()}
                </span>
            </div>

            </div>
        ))}
        </div>
    ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500">No compression history yet.</p>
          <p className="mt-1 text-sm text-zinc-600">Compress a file to see it here!</p>
        </div>
    )}
    </div>
  );
}