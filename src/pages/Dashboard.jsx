import { useState } from 'react';
import { useClasses } from '../context/ClassContext';
import ClassCard from '../components/ClassCard';
import { Plus, Download } from 'lucide-react';

export default function Dashboard() {
    const { classes, addClass, deleteClass, exportData } = useClasses();
    const [isAdding, setIsAdding] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    const handleAddClass = (e) => {
        e.preventDefault();
        if (newClassName.trim()) {
            addClass(newClassName.trim());
            setNewClassName('');
            setIsAdding(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classes</h1>
                    <p className="text-gray-500 mt-1">Manage your classes and attendance</p>
                </div>
                <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export Data</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Class Card / Button */}
                {isAdding ? (
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-primary/20 ring-4 ring-primary/5 transition-all">
                        <form onSubmit={handleAddClass}>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">New Class</h3>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Class Name (e.g. Grade 5)"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={!newClassName.trim()}
                                    className="flex-1 bg-primary text-white py-2 rounded-xl font-medium hover:bg-blue-900 disabled:opacity-50 transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl hover:bg-white hover:border-primary/50 hover:shadow-md transition-all group min-h-[180px]"
                    >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary mb-3 group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold text-gray-600 group-hover:text-primary">Add New Class</span>
                    </button>
                )}

                {classes.map((c) => (
                    <ClassCard key={c.id} classItem={c} onDelete={deleteClass} />
                ))}
            </div>
        </div>
    );
}
