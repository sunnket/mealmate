import { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream;
    let animationId;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Simulated scan for demo — in production use BarcodeDetector API or a QR lib
  const handleManualScan = () => {
    const hash = prompt('Enter QR code hash (for demo):');
    if (hash) {
      onScan(hash);
    }
  };

  return (
    <div className="relative w-full">
      <div className="glass-card overflow-hidden p-0 hover:glow-blue transition-all duration-500">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover bg-black/60"
          />
          {/* Premium Corner markers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-6 w-12 h-12 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
            <div className="absolute top-6 right-6 w-12 h-12 border-t-[3px] border-r-[3px] border-primary rounded-tr-2xl" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-[3px] border-l-[3px] border-primary rounded-bl-2xl" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />
            {/* Animated scan line */}
            {scanning && (
              <div className="absolute left-6 right-6 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 animate-bounce shadow-glow" style={{ top: '50%' }} />
            )}
          </div>
          {/* Premium Status overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-bold text-primary px-3 py-2 rounded-full bg-black/60 backdrop-blur-xl border-2 border-primary/30 shadow-glow">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-blue" />
            Camera Active
          </div>
        </div>
      </div>
      {error && (
        <div className="text-danger text-sm mt-4 text-center p-4 rounded-2xl bg-danger/[0.1] border-2 border-danger/20 font-semibold">{error}</div>
      )}
      <button
        onClick={handleManualScan}
        className="btn-ghost w-full mt-4 py-4 text-sm font-bold"
      >
        📷 Manual Scan (Demo)
      </button>
    </div>
  );
}
