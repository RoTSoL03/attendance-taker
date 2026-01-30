import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, AlertTriangle } from 'lucide-react';

export default function NoiseMeter({ onClose }) {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [sensitivity, setSensitivity] = useState(50); // 0-100
    const [error, setError] = useState(null);
    const [maxVolume, setMaxVolume] = useState(0);

    const audioContextRef = useRef(null);
    const analyzerRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const rafRef = useRef(null);
    const streamRef = useRef(null);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            analyzerRef.current = analyzer;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyzer);
            sourceRef.current = source;

            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            dataArrayRef.current = dataArray;

            setIsListening(true);
            setError(null);
            tick();
        } catch (err) {
            console.error("Microphone access denied:", err);
            setError("Microphone access denied. Please allow permission.");
        }
    };

    const stopListening = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

        setIsListening(false);
        setVolume(0);
    };

    const tick = () => {
        if (!analyzerRef.current) return;

        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate average volume
        const array = dataArrayRef.current;
        let values = 0;
        for (let i = 0; i < array.length; i++) {
            values += array[i];
        }
        const average = values / array.length;

        // Normalize roughly 0-100 (empirically, average is usually 0-128 range for speech)
        const normalizedVolume = Math.min(100, (average / 128) * 100 * (sensitivity / 50));

        setVolume((prev) => prev * 0.8 + normalizedVolume * 0.2); // Smooth it out
        if (normalizedVolume > maxVolume) setMaxVolume(normalizedVolume);

        rafRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        startListening();
        return () => stopListening();
    }, []);

    // Warn if too loud (threshold > 80 after sensitivity)
    const isTooLoud = volume > 80;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col items-center relative transition-colors duration-300 border-4 ${isTooLoud ? 'border-red-500 bg-red-50' : 'border-transparent'}`}>

                {/* Header */}
                <div className="w-full p-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                        <Volume2 size={24} className={isTooLoud ? "text-red-500 animate-pulse" : "text-primary"} />
                        <span>Bantoto Ear</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 w-full flex flex-col items-center">

                    {error ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center mb-6">
                            <AlertTriangle className="inline-block mb-2" />
                            <p>{error}</p>
                            <button
                                onClick={startListening}
                                className="mt-4 px-4 py-2 bg-red-200 hover:bg-red-300 rounded-lg text-sm font-bold"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Visualizer Balls */}
                            <div className="h-64 flex items-end justify-center gap-2 mb-8 w-full">
                                {[...Array(5)].map((_, i) => {
                                    // Staggered heights based on volume
                                    // Just a simple visual effect
                                    const heightBase = volume;
                                    const heightVar = Math.sin(Date.now() / 100 + i) * 20; // Needs continuous render, but component re-renders on volume change so okay-ish
                                    // Actually Framer Motion is better for smooth animation
                                    // Let's stick to CSS transition on height

                                    // Simple single bar for now or 3 bars
                                    return (
                                        <div
                                            key={i}
                                            className={`w-12 rounded-full transition-all duration-100 ease-out ${isTooLoud ? 'bg-red-500' : 'bg-gradient-to-t from-green-400 to-blue-500'}`}
                                            style={{
                                                height: `${Math.max(10, Math.min(100, volume * (1 + i * 0.2)))}%`,
                                                opacity: isListening ? 1 : 0.3
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Warning Text */}
                            <div className="h-12 flex items-center justify-center mb-4">
                                {isTooLoud ? (
                                    <span className="text-2xl font-black text-red-600 animate-bounce uppercase tracking-widest">
                                        Too Loud! 🤫
                                    </span>
                                ) : (
                                    <span className="text-gray-400 font-medium">
                                        {isListening ? "Monitoring..." : "Click Start to listen"}
                                    </span>
                                )}
                            </div>

                            {/* Sensitivity Slider */}
                            <div className="w-full mb-8">
                                <label className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                    <span>Sensitivity</span>
                                    <span>{sensitivity}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={sensitivity}
                                    onChange={(e) => setSensitivity(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Toggle Button */}
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isListening
                                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                    : 'bg-primary text-white hover:bg-blue-600 hover:scale-105'
                                    }`}
                            >
                                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
