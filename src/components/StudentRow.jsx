import { Check, X, Clock, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const StatusButton = ({ type, icon: Icon, isActive, activeClass, onStatusChange, isEditing }) => ( // eslint-disable-line no-unused-vars
    <button
        onClick={() => onStatusChange(type)}
        disabled={isEditing}
        className={clsx(
            "p-2 rounded-xl transition-all flex items-center justify-center min-w-[44px] min-h-[44px]",
            isActive ? activeClass : "text-gray-400 hover:bg-gray-100",
            isActive && "shadow-sm transform scale-105",
            isEditing && "opacity-50 cursor-not-allowed"
        )}
    >
        <Icon size={20} strokeWidth={3} />
    </button>
);

export default function StudentRow({ student, status, onStatusChange, isEditing, isSelected, onToggleSelect }) {
    return (
        <div
            className={clsx(
                "flex items-center p-3 bg-white rounded-2xl border transition-colors mb-3",
                isSelected ? "border-primary bg-blue-50" : "border-gray-100 shadow-sm"
            )}
            onClick={() => isEditing && onToggleSelect(student.id)}
        >
            {/* Left Side: Checkbox (Edit Mode) & Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {isEditing && (
                    <div className={clsx(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 mr-1",
                        isSelected ? "bg-primary border-primary" : "border-gray-300 bg-white"
                    )}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                    </div>
                )}

                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200 flex-shrink-0 text-sm">
                    {student.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-900 text-base">{student.name}</span>
            </div>

            {/* Right Side: Attendance Buttons */}
            <div className={clsx("flex items-center gap-1 bg-gray-50 p-1 rounded-2xl ml-4 flex-shrink-0 transition-opacity", isEditing && "opacity-40 pointer-events-none")}>
                <StatusButton
                    type="present"
                    icon={Check}
                    isActive={status === 'present'}
                    activeClass="bg-green-100 text-green-600"
                    onStatusChange={onStatusChange}
                    isEditing={isEditing}
                />
                <StatusButton
                    type="late"
                    icon={Clock}
                    isActive={status === 'late'}
                    activeClass="bg-yellow-100 text-yellow-600"
                    onStatusChange={onStatusChange}
                    isEditing={isEditing}
                />
                <StatusButton
                    type="absent"
                    icon={X}
                    isActive={status === 'absent'}
                    activeClass="bg-red-100 text-red-600"
                    onStatusChange={onStatusChange}
                    isEditing={isEditing}
                />
            </div>
        </div>
    );
}
