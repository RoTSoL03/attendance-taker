import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AddStudentForm({ onAdd }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim());
            setName('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <input
                type="text"
                placeholder="Add student name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
            <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
                <Plus size={24} />
            </button>
        </form>
    );
}
