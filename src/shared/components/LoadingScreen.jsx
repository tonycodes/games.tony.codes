export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-white/50 text-sm mt-4 font-mono">Loading...</p>
      </div>
    </div>
  );
}
