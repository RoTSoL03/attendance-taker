import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClasses } from '../context/ClassContext';
import AddStudentForm from '../components/AddStudentForm';
import StudentRow from '../components/StudentRow';
import { ArrowLeft, Calendar, Users, Pencil, Trash2, X, Dices, Shuffle, Timer, Volume2 } from 'lucide-react';
import WheelOfNames from '../components/WheelOfNames';
import RandomGrouper from '../components/RandomGrouper';
import ClassroomTimer from '../components/ClassroomTimer';
import NoiseMeter from '../components/NoiseMeter';
import { format } from 'date-fns';

export default function ClassDetail() {
    const { classId } = useParams();

    const { classes, addStudent, removeStudent, updateAttendance } = useClasses();

    // Default to today YYYY-MM-DD
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState(new Set());

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        setSelectedStudents(new Set());
    };

    // Wheel State
    const [showWheel, setShowWheel] = useState(false);
    // Grouper State
    const [showGrouper, setShowGrouper] = useState(false);
    // Tools State
    const [showTimer, setShowTimer] = useState(false);
    const [showNoiseMeter, setShowNoiseMeter] = useState(false);

    const toggleStudentSelection = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to remove ${selectedStudents.size} students?`)) {
            selectedStudents.forEach(id => removeStudent(classId, id));
            setIsEditing(false);
            setSelectedStudents(new Set());
        }
    };

    const classData = classes.find((c) => c.id === classId);

    if (!classData) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-400">Class not found</h2>
                <Link to="/" className="text-primary mt-4 inline-block hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const attendanceForDate = classData.attendance[date] || {};

    const handleStatusChange = (studentId, newStatus) => {
        // If clicking the same status, toggle off (remove status)? Or keep as is.
        // Requirement says "Toggle state". Let's assume clicking 'present' when already 'present' might mean nothing or toggle.
        // Usually, radio behavior is better. I will just set the status.
        updateAttendance(classId, date, studentId, newStatus);
    };

    const formattedDate = date ? format(new Date(date), 'MMMM d, yyyy') : 'Select Date';

    return (
        <div>
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    Back
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                        <div className="flex items-center text-gray-500 mt-1 gap-2">
                            <Users size={16} />
                            <span>{classData.students.length} Students</span>
                        </div>
                    </div>

                    <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <Calendar size={20} className="text-gray-400 ml-2" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-3 py-2 bg-transparent focus:outline-none text-gray-700 font-medium"
                        />
                    </div>
                </div>
            </div>


            {/* Sort students alphabetically */}
            {
                (() => {
                    if (classData && classData.students) {
                        classData.students.sort((a, b) => a.name.localeCompare(b.name));
                    }
                    return null;
                })()
            }

            <div className="flex flex-col gap-6 mb-8">
                <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Student</h2>
                    <AddStudentForm onAdd={(name) => addStudent(classId, name)} />
                </div>

                {/* Gamified Mode Card */}
                <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10 flex-1">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            Classroom Mode
                        </h3>
                        <p className="text-blue-100 opacity-90 text-lg">
                            Your comprehensive teacher toolkit. Take attendance, pick random students, create groups, time activities, and monitor noise levels.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-wrap gap-3 justify-end">
                        <Link
                            to={`/class/${classId}/session`}
                            className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-center hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            <Users size={20} />
                            Session
                        </Link>
                        <button
                            onClick={() => setShowWheel(true)}
                            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-white/20 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px] border border-white/20"
                        >
                            <Dices size={20} />
                            Wheel
                        </button>
                        <button
                            onClick={() => setShowGrouper(true)}
                            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-white/20 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px] border border-white/20"
                        >
                            <Shuffle size={20} />
                            Groups
                        </button>
                        <button
                            onClick={() => setShowTimer(true)}
                            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-white/20 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px] border border-white/20"
                        >
                            <Timer size={20} />
                            Timer
                        </button>
                        <button
                            onClick={() => setShowNoiseMeter(true)}
                            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-white/20 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 min-w-[140px] border border-white/20"
                        >
                            <Volume2 size={20} />
                            Ear
                        </button>
                    </div>


                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                {selectedStudents.size > 0 && (
                                    <button
                                        onClick={handleDeleteSelected}
                                        className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete ({selectedStudents.size})
                                    </button>
                                )}
                                <button
                                    onClick={toggleEditMode}
                                    className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X size={14} />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full mr-2">
                                    {formattedDate}
                                </span>
                                <button
                                    onClick={toggleEditMode}
                                    className="text-gray-400 hover:text-primary transition-colors p-1"
                                    title="Edit Class"
                                >
                                    <Pencil size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {classData.students.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No students yet. Add one above!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {classData.students.map((student) => {
                            const status = attendanceForDate[student.id];
                            return (
                                <StudentRow
                                    key={student.id}
                                    student={student}
                                    status={status}
                                    onStatusChange={(newStatus) => handleStatusChange(student.id, newStatus)}
                                    // Edit Mode Props
                                    isEditing={isEditing}
                                    isSelected={selectedStudents.has(student.id)}
                                    onToggleSelect={toggleStudentSelection}
                                />
                            );
                        })}
                    </div>
                )}
            </div>


            {/* Wheel of Names Modal */}
            {
                showWheel && (
                    <WheelOfNames
                        students={classData.students}
                        onClose={() => setShowWheel(false)}
                    />
                )
            }

            {/* Random Grouper Modal */}
            {showGrouper && (
                <RandomGrouper
                    students={classData.students}
                    onClose={() => setShowGrouper(false)}
                />
            )}

            {/* Timer Modal */}
            {showTimer && <ClassroomTimer onClose={() => setShowTimer(false)} />}

            {/* Noise Meter Modal */}
            {showNoiseMeter && <NoiseMeter onClose={() => setShowNoiseMeter(false)} />}
        </div >
    );
}
