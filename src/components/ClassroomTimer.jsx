import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer, Bell } from 'lucide-react';

export default function ClassroomTimer({ onClose }) {
    // Time in seconds
    const [timeLeft, setTimeLeft] = useState(300); // Default 5 mins
    const [initialTime, setInitialTime] = useState(300);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const intervalRef = useRef(null);

    const playSound = () => {
        // Simple oscillator beep
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const presets = [
        { label: '1m', value: 60 },
        { label: '5m', value: 300 },
        { label: '10m', value: 600 },
        { label: '15m', value: 900 },
        { label: '25m', value: 1500 },
    ];

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsFinished(true);
                        setIsRunning(false);
                        playSound();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    const toggleTimer = () => {
        if (timeLeft === 0) resetTimer();
        else setIsRunning(!isRunning);
        setIsFinished(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsFinished(false);
        setTimeLeft(initialTime);
    };

    const setTime = (seconds) => {
        setIsRunning(false);
        setIsFinished(false);
        setInitialTime(seconds);
        setTimeLeft(seconds);
    };



    // Format time mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Circular Progress Calc
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / initialTime;
    const dashoffset = circumference - progress * circumference;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col items-center relative">
                {/* Header */}
                <div className="w-full p-4 flex justify-between items-center absolute top-0 left-0 z-10">
                    <div className="flex items-center gap-2 text-gray-500 font-bold px-2">
                        <Timer size={20} />
                        <span>Timer</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="pt-16 pb-8 px-8 flex flex-col items-center w-full">
                    {/* Timer Display with SVG Circle */}
                    <div className="relative mb-8">
                        {/* Ring */}
                        <svg width="280" height="280" className="transform -rotate-90">
                            <circle
                                cx="140"
                                cy="140"
                                r={radius}
                                stroke="#f3f4f6"
                                strokeWidth="12"
                                fill="transparent"
                            />
                            <circle
                                cx="140"
                                cy="140"
                                r={radius}
                                stroke={isFinished ? "#EF476F" : "#3B82F6"}
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        {/* Time Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-6xl font-mono font-bold tracking-wider ${isFinished ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                                {isFinished ? "00:00" : formatTime(timeLeft)}
                            </span>
                            {isFinished && (
                                <span className="text-red-500 font-bold mt-2 flex items-center gap-1 animate-bounce">
                                    <Bell size={16} /> Time's Up!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={toggleTimer}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isRunning
                                ? 'bg-amber-400 hover:bg-amber-500'
                                : 'bg-primary hover:bg-blue-600'
                                }`}
                        >
                            {isRunning ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
                        >
                            <RotateCcw size={28} />
                        </button>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-5 gap-2 w-full">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setTime(preset.value)}
                                className={`py-2 rounded-lg font-medium text-sm transition-colors ${initialTime === preset.value
                                    ? 'bg-blue-50 text-primary ring-2 ring-primary/20'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
