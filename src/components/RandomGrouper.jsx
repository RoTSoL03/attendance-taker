import { useState } from 'react';
import { X, Users, RefreshCw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

export default function RandomGrouper({ students, onClose, onGroupsGenerated }) {
    const [method, setMethod] = useState('count'); // 'count' = Number of Groups, 'size' = Members per Group
    const [inputValue, setInputValue] = useState(2);
    const [groups, setGroups] = useState([]);
    const [isGenerated, setIsGenerated] = useState(false);
    const [copiedGroupIndex, setCopiedGroupIndex] = useState(null);

    const generateGroups = () => {
        if (students.length === 0) return;

        // Shuffle students
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        const newGroups = [];

        if (method === 'count') {
            const numGroups = Math.max(1, Math.min(parseInt(inputValue) || 1, students.length));

            // Initialize empty groups
            for (let i = 0; i < numGroups; i++) {
                newGroups.push([]);
            }

            // Distribute students
            shuffled.forEach((student, index) => {
                const groupIndex = index % numGroups;
                newGroups[groupIndex].push(student);
            });
        } else {
            // By group size
            const size = Math.max(1, parseInt(inputValue) || 1);
            for (let i = 0; i < shuffled.length; i += size) {
                newGroups.push(shuffled.slice(i, i + size));
            }
        }

        setGroups(newGroups);
        setIsGenerated(true);

        // Broadcast
        if (onGroupsGenerated) {
            // Convert to simple array of names for lighter payload
            const simpleGroups = newGroups.map(g => g.map(s => s.name));
            onGroupsGenerated(simpleGroups);
        }
    };

    const copyToClipboard = (group, index) => {
        const text = group.map(s => s.name).join('\n');
        navigator.clipboard.writeText(text);
        setCopiedGroupIndex(index);
        setTimeout(() => setCopiedGroupIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-primary" /> Random Group Generator
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Controls Sidebar */}
                    <div className="w-full md:w-80 bg-gray-50/50 p-6 border-r border-gray-100 flex flex-col gap-6 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grouping Method</label>
                            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => setMethod('count')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${method === 'count'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    # of Groups
                                </button>
                                <button
                                    onClick={() => setMethod('size')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${method === 'size'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Group Size
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {method === 'count' ? 'Number of Groups' : 'Students per Group'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={students.length}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Total Students: {students.length}
                            </p>
                        </div>

                        <button
                            onClick={generateGroups}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} className={isGenerated ? "" : "animate-spin-slow"} />
                            {isGenerated ? 'Regenerate Groups' : 'Generate Groups'}
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white">
                        {groups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {groups.map((group, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
                                        >
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                                                <h3 className="font-bold text-gray-800">Group {i + 1}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {group.length}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(group, i)}
                                                        className="text-gray-400 hover:text-primary transition-colors"
                                                        title="Copy List"
                                                    >
                                                        {copiedGroupIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <ul className="space-y-2">
                                                {group.map(student => (
                                                    <li key={student.id} className="text-sm text-gray-600 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-primary text-xs flex items-center justify-center font-bold">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        {student.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                <Users size={64} className="mb-4" />
                                <p className="text-lg font-medium">Ready to create groups!</p>
                                <p className="text-sm">Adjust settings and click Generate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
