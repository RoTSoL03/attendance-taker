import { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const COLORS = [
    '#EF476F', // Red-ish
    '#FFD166', // Yellow
    '#06D6A0', // Green
    '#118AB2', // Blue
    '#073B4C', // Dark Blue
    '#9D4EDD', // Purple
    '#FF9F1C', // Orange
    '#2EC4B6'  // Teal
];

export default function WheelOfNames({ students, onClose, onSpinStart, onSpinEnd }) {
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const controls = useAnimation();
    const rotationRef = useRef(0); // Track total rotation to prevent rewinding

    // Ensure we have at least a few segments for visuals
    const displayStudents = students.length > 0 ? students : [{ id: 'demo', name: 'Add Students!' }];
    const totalSegments = displayStudents.length;
    const anglePerSegment = 360 / totalSegments;

    const spinWheel = async () => {
        if (spinning || students.length === 0) return;

        setSpinning(true);
        setWinner(null);
        if (onSpinStart) onSpinStart();

        // Calculate new total rotation
        const spinAmount = 1800 + (Math.random() * 360);
        const newTotalRotation = rotationRef.current + spinAmount;
        rotationRef.current = newTotalRotation;

        await controls.start({
            rotate: newTotalRotation,
            transition: {
                duration: 4,
                ease: [0.2, 0.8, 0.2, 1], // Cubic bezier for "spin up and slow down"
                type: "tween"
            }
        });

        // Calculate winner
        const finalAngle = newTotalRotation % 360;
        const winningAngle = (360 - finalAngle) % 360;
        const winnerIndex = Math.floor(winningAngle / anglePerSegment);
        const winnerStudent = displayStudents[winnerIndex];

        setWinner(winnerStudent);
        setSpinning(false);
        if (onSpinEnd) onSpinEnd(winnerStudent.name);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🎡 Wheel of Names
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center justify-center flex-1 overflow-y-auto">

                    <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                        {/* Pointer */}
                        <div className="absolute top-1/2 -right-4 w-0 h-0 
                                      border-t-[12px] border-t-transparent
                                      border-b-[12px] border-b-transparent
                                      border-r-[24px] border-r-gray-800 
                                      -translate-y-1/2 rotate-180 z-20 drop-shadow-lg">
                        </div>

                        {/* Wheel */}
                        <motion.div
                            className="w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white relative"
                            animate={controls}
                            style={{ transformOrigin: 'center' }}
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
                                {displayStudents.map((student, i) => {
                                    // Calculate path for wedge
                                    const startAngle = i * anglePerSegment;
                                    const endAngle = (i + 1) * anglePerSegment;

                                    // Convert polar to cartesian
                                    // center is 50,50, radius 50
                                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                    const largeArc = anglePerSegment > 180 ? 1 : 0;

                                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                    return (
                                        <g key={student.id || i}>
                                            <path
                                                d={pathData}
                                                fill={COLORS[i % COLORS.length]}
                                                stroke="white"
                                                strokeWidth="0.5"
                                            />
                                            {/* Text Label - simplified positioning */}
                                            <text
                                                x="50"
                                                y="50"
                                                fill="white"
                                                fontSize="4"
                                                fontWeight="bold"
                                                textAnchor="end"
                                                dominantBaseline="middle"
                                                transform={`rotate(${startAngle + anglePerSegment / 2}, 50, 50) translate(45, 0)`}
                                            >
                                                {student.name.length > 12 ? student.name.substring(0, 10) + '..' : student.name}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </motion.div>

                        {/* Center Cap */}
                        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md z-10 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    {/* Winner Display or Action Button */}
                    <div className="h-24 flex items-center justify-center w-full">
                        {winner ? (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <p className="text-gray-500 font-medium mb-1">The winner is</p>
                                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                    {winner.name}
                                </h3>
                                <div className="flex justify-center mt-2">
                                    <Trophy className="text-yellow-400 fill-yellow-400 w-8 h-8 animate-bounce" />
                                </div>
                            </motion.div>
                        ) : (
                            <p className="text-gray-400 font-medium text-lg">
                                {spinning ? "Spinning..." : "Ready to pick a winner!"}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={spinWheel}
                        disabled={spinning || students.length === 0}
                        className={`mt-4 w-full py-4 rounded-2xl font-bold text-lg shadow-lg transform transition-all 
                            ${spinning || students.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/30'
                            }`}
                    >
                        {spinning ? 'Good Luck!' : 'Spin the Wheel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
