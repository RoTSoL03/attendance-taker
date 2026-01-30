import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Users, GraduationCap } from 'lucide-react';

export default function JoinClass() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formattedCode = code.toUpperCase().trim();

            // 1. Check if class exists using RPC
            const { data: classData, error: classError } = await supabase
                .rpc('get_class_by_code', { code_input: formattedCode })
                .maybeSingle();

            if (classError || !classData) {
                console.error("Join Error:", classError);
                throw new Error("Invalid Class Code. Please try again.");
            }

            // 2. Save to local storage (simple session for now)
            localStorage.setItem('joinedClassId', classData.id);
            localStorage.setItem('joinedClassName', classData.name);

            // 3. Navigate to Lobby
            navigate('/lobby');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Join a Class</h1>
                    <p className="text-gray-500 mt-2">Enter the 6-character code shared by your teacher.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="ABCD-12"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="w-full text-center text-3xl font-mono tracking-widest py-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none uppercase transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 3}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Joining...' : 'Join Class'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-400 text-sm mb-2">Are you a teacher?</p>
                    <Link to="/auth" className="flex items-center justify-center gap-2 text-gray-600 font-bold hover:text-primary transition-colors">
                        <GraduationCap size={18} />
                        Teacher Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
