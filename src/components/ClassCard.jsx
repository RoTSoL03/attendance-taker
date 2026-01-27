import { Link } from 'react-router-dom';
import { Users, Trash2 } from 'lucide-react';

export default function ClassCard({ classItem, onDelete }) {
    return (
        <div className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
                            onDelete(classItem.id);
                        }
                    }}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-white/50 hover:bg-white rounded-full backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Delete Class"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <Link to={`/class/${classItem.id}`} className="block">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {classItem.name}
                </h3>

                <div className="flex items-center text-gray-500 space-x-2">
                    <Users size={18} />
                    <span className="font-medium">{classItem.students.length} Students</span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary bg-blue-50 px-3 py-1 rounded-full">
                        View Details
                    </span>
                </div>
            </Link>
        </div>
    );
}
