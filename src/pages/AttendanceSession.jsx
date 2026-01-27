import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClasses } from '../context/ClassContext';
import { Check, X, Clock, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function AttendanceSession() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { classes, updateAttendance } = useClasses();

    const [date] = useState(() => new Date().toISOString().split('T')[0]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [lastDirection, setLastDirection] = useState(null); // 'left' | 'right' | 'down'

    // Get class and students
    const classData = classes.find(c => c.id === classId);

    // Sort students alphabetically to match list
    const students = classData ? [...classData.students].sort((a, b) => a.name.localeCompare(b.name)) : [];

    if (!classData) return null;

    const currentStudent = students[currentIndex];

    const handleAttendance = (status) => {
        let direction = 'down';
        if (status === 'present') direction = 'right';
        if (status === 'absent') direction = 'left';

        setLastDirection(direction);

        updateAttendance(classId, date, currentStudent.id, status);

        if (currentIndex < students.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 50);
        } else {
            setTimeout(() => setIsComplete(true), 200);
        }
    };

    const progress = Math.round(((currentIndex) / students.length) * 100);

    // Animation Variants
    const cardVariants = {
        enter: { scale: 0.8, opacity: 0, y: 50 },
        center: { scale: 1, opacity: 1, y: 0, x: 0, rotate: 0, backgroundColor: '#ffffff' },
        exit: (direction) => {
            switch (direction) {
                case 'left':
                    return {
                        x: -500,
                        opacity: 0,
                        rotate: -45,
                        backgroundColor: '#fee2e2', // red-100
                        transition: { duration: 0.4 }
                    };
                case 'right':
                    return {
                        x: 500,
                        opacity: 0,
                        rotate: 45,
                        backgroundColor: '#dcfce7', // green-100
                        transition: { duration: 0.4 }
                    };
                case 'down':
                    return {
                        y: 500,
                        opacity: 0,
                        backgroundColor: '#fef9c3', // yellow-100
                        transition: { duration: 0.4 }
                    };
                default:
                    return { opacity: 0, scale: 0.5 };
            }
        }
    };

    if (isComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <Check size={48} strokeWidth={4} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h1>
                <p className="text-gray-500 mb-8">You have marked attendance for all {students.length} students.</p>

                <div className="flex flex-col gap-3 w-full max-w-sm">
                    <Link
                        to={`/class/${classId}`}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-blue-900 transition-colors"
                    >
                        Return to Class
                    </Link>
                    <button
                        onClick={() => {
                            setCurrentIndex(0);
                            setIsComplete(false);
                        }}
                        className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Start Over
                    </button>
                </div>
            </motion.div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">No students to mark</h2>
                <Link to={`/class/${classId}`} className="text-primary mt-4 block">Go Back</Link>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex-none p-6 flex items-center justify-between">
                <Link to={`/class/${classId}`} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
                    {currentIndex + 1} / {students.length}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Progress Bar */}
            <div className="flex-none px-6 mb-8">
                <div className="h-1.5 bg-gray-200 rounded-full w-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Main Card Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-lg mx-auto relative">
                <AnimatePresence mode="popLayout" custom={lastDirection}>
                    <motion.div
                        key={currentStudent.id}
                        custom={lastDirection}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full flex flex-col items-center justify-between relative z-10 h-[65vh] min-h-[500px]"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <div className="w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center text-6xl font-bold text-gray-300 mb-6">
                                {currentStudent.name.charAt(0)}
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-2 tracking-tight line-clamp-2">
                                {currentStudent.name}
                            </h2>
                            <p className="text-gray-400 font-medium text-base tracking-wider uppercase">Student</p>
                        </div>

                        {/* Controls inside card */}
                        <div className="w-full grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                            <button
                                onClick={() => handleAttendance('absent')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-100 group-active:scale-95 transition-all duration-200">
                                    <X size={28} strokeWidth={3} />
                                </div>
                                <span className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider group-hover:text-red-500 transition-colors">Absent</span>
                            </button>

                            <button
                                onClick={() => handleAttendance('late')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:bg-yellow-100 group-active:scale-95 transition-all duration-200">
                                    <Clock size={28} strokeWidth={3} />
                                </div>
                                <span className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider group-hover:text-yellow-500 transition-colors">Late</span>
                            </button>

                            <button
                                onClick={() => handleAttendance('present')}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 group-hover:bg-green-100 group-active:scale-95 transition-all duration-200">
                                    <Check size={28} strokeWidth={3} />
                                </div>
                                <span className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider group-hover:text-green-500 transition-colors">Present</span>
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
