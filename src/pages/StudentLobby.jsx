import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, CheckCircle2, Hand } from 'lucide-react';

export default function StudentLobby() {
    const navigate = useNavigate();
    const classId = localStorage.getItem('joinedClassId');
    const className = localStorage.getItem('joinedClassName');

    // State
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(localStorage.getItem('studentId') || null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(!!localStorage.getItem('studentId'));
    const [handRaised, setHandRaised] = useState(false);
    const [error, setError] = useState(null);

    // Broadcast State
    const [broadcastOverlay, setBroadcastOverlay] = useState(null); // { type, payload }

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('students')
                .select('*')
                .eq('class_id', classId)
                .order('name');

            if (fetchError) throw fetchError;

            if (data) {
                setStudents(data);
                if (selectedStudentId) {
                    const me = data.find(s => s.id === selectedStudentId);
                    if (me) {
                        setHandRaised(!!me.hand_raised_at);
                    } else {
                        // Was deleted or incorrect ID
                        // Don't auto-logout yet to avoid jarring UX, but maybe warn?
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError("Unable to connect to class. The class might have ended or you were removed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!classId) {
            navigate('/join');
            return;
        }
        fetchStudents();

        // 1. Database Subscription (New Students + Hand State)
        const dbChannel = supabase
            .channel(`public:students:${classId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `class_id=eq.${classId}` }, payload => {
                fetchStudents();
                // If update touches me, update my hand state
                if (payload.new && payload.new.id === selectedStudentId) {
                    setHandRaised(!!payload.new.hand_raised_at);
                }
            })
            .subscribe();

        // 2. Room Subscription (Presence + Broadcasts)
        const roomChannel = supabase.channel(`room:${classId}`, {
            config: {
                presence: {
                    key: selectedStudentId || 'anon-' + Math.random(),
                },
            },
        });

        roomChannel
            .on('broadcast', { event: 'WHEEL_SPIN_START' }, () => {
                setBroadcastOverlay({ type: 'WHEEL_SPIN' });
            })
            .on('broadcast', { event: 'WHEEL_SPIN_END' }, ({ payload }) => {
                setBroadcastOverlay({ type: 'WHEEL_WINNER', payload });
            })
            .on('broadcast', { event: 'WHEEL_CLOSE' }, () => {
                setBroadcastOverlay(null);
            })
            .on('broadcast', { event: 'GROUPS_GENERATED' }, ({ payload }) => {
                setBroadcastOverlay({ type: 'GROUPS', payload });
            })
            .on('broadcast', { event: 'GROUP_CLOSE' }, () => setBroadcastOverlay(null))
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED' && selectedStudentId) {
                    // Track presence
                    await roomChannel.track({
                        studentId: selectedStudentId,
                        studentName: localStorage.getItem('studentName'),
                        joinedAt: new Date().toISOString()
                    });
                }
            });

        return () => {
            supabase.removeChannel(dbChannel);
            supabase.removeChannel(roomChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, selectedStudentId]);

    const handleSelectMe = async (student) => {
        // Optimistic check
        if (student.taken_at && (new Date(student.taken_at) > new Date(Date.now() - 1000 * 60 * 60 * 2))) {
            // If taken within last 2 hours, consider it taken. 
            // (Optional timeout to auto-release old sessions if logic fails)
            setError(`"${student.name}" is already taken.`);
            return;
        }

        try {
            setLoading(true);
            const { data: success, error: claimError } = await supabase
                .rpc('claim_student', { s_id: student.id });

            if (claimError) throw claimError;

            if (success) {
                localStorage.setItem('studentId', student.id);
                localStorage.setItem('studentName', student.name);
                setSelectedStudentId(student.id);
                setIsRegistered(true);
                window.location.reload();
            } else {
                setError(`"${student.name}" was just taken by someone else.`);
                fetchStudents(); // Refresh list
            }
        } catch (err) {
            console.error("Claim error:", err);
            setError("Failed to join. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        const sId = localStorage.getItem('studentId');
        if (sId) {
            try {
                await supabase.rpc('release_student', { s_id: sId });
            } catch (e) { console.error("Release error", e); }
        }

        localStorage.removeItem('joinedClassId');
        localStorage.removeItem('joinedClassName');
        localStorage.removeItem('studentId');
        localStorage.removeItem('studentName');
        navigate('/join');
    };

    const toggleHand = async () => {
        if (!selectedStudentId) return;

        try {
            if (handRaised) {
                // Lower hand
                await supabase.rpc('lower_hand', { s_id: selectedStudentId });
                setHandRaised(false); // Optimistic
            } else {
                // Raise hand
                await supabase.rpc('raise_hand', { s_id: selectedStudentId });
                setHandRaised(true); // Optimistic
            }
        } catch (err) {
            console.error("Hand toggle error:", err);
            // Revert state if needed, but optimistic is fine for now
        }
    };

    if (loading && !students.length) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <h2 className="text-white text-xl font-bold">Connecting to Class...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Issue</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => { setError(null); fetchStudents(); }}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold mb-3 hover:bg-blue-600"
                    >
                        Retry Connection
                    </button>
                    <button
                        onClick={handleLeave}
                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200"
                    >
                        Back to Join
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center p-4 relative overflow-hidden">

            {/* Broadcast Overlays */}
            {broadcastOverlay?.type === 'WHEEL_SPIN' && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white animate-fade-in">
                    <div className="animate-spin text-6xl mb-4">🎡</div>
                    <h2 className="text-3xl font-bold animate-pulse">Spinning...</h2>
                </div>
            )}
            {broadcastOverlay?.type === 'WHEEL_WINNER' && (
                <div className="absolute inset-0 z-50 bg-green-500 flex flex-col items-center justify-center text-white animate-confetti">
                    <h2 className="text-2xl font-bold opacity-80">Winner!</h2>
                    <h1 className="text-6xl font-black mt-4">{broadcastOverlay.payload.winner}</h1>
                </div>
            )}
            {broadcastOverlay?.type === 'GROUPS' && (
                <div className="absolute inset-0 z-50 bg-blue-600 flex flex-col p-8 text-white overflow-y-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center">New Groups!</h2>
                    <div className="grid gap-4">
                        {broadcastOverlay.payload.groups?.map((group, i) => {
                            const amIInGroup = group.some(n => n === localStorage.getItem('studentName'));
                            return (
                                <div key={i} className={`p-4 rounded-xl ${amIInGroup ? 'bg-white text-blue-900 ring-4 ring-yellow-400' : 'bg-blue-500/50'}`}>
                                    <h3 className="font-bold mb-2 opacity-50 uppercase tracking-widest text-xs">Group {i + 1}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {group.map(name => (
                                            <span key={name} className="font-medium">{name}</span>
                                        ))}
                                    </div>
                                    {amIInGroup && <div className="mt-2 text-sm font-bold text-green-600 flex items-center gap-1">⭐ You are here</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center text-white mb-8 mt-4 z-10">
                <div>
                    <p className="text-blue-200 text-sm font-medium">Classroom</p>
                    <h1 className="text-2xl font-bold">{className}</h1>
                </div>
                <button
                    onClick={handleLeave}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    title="Leave Class"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden mb-4 z-10 relative">

                {!isRegistered ? (
                    <div className="p-6 flex flex-col h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Who are you?</h2>
                        <p className="text-gray-500 mb-6">Select your name from the list to join.</p>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {students.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No students found.
                                </div>
                            ) : (
                                students.map(student => {
                                    const isTaken = !!student.taken_at;
                                    return (
                                        <button
                                            key={student.id}
                                            onClick={() => !isTaken && handleSelectMe(student)}
                                            disabled={isTaken}
                                            className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 group text-left ${isTaken
                                                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : 'border-gray-100 hover:border-primary hover:bg-blue-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isTaken ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 group-hover:bg-white text-gray-500'
                                                }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${isTaken ? 'text-gray-400' : 'text-gray-700 group-hover:text-primary'}`}>
                                                    {student.name}
                                                </span>
                                                {isTaken && <span className="text-xs text-gray-400 font-medium">Already joined</span>}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center h-full text-center relative">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're In!</h2>
                        <p className="text-gray-500 mb-12">Welcome, {localStorage.getItem('studentName')}.</p>

                        {/* Interaction Button */}
                        <button
                            onClick={toggleHand}
                            className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${handRaised ? 'bg-orange-100 text-orange-400 hover:bg-orange-200' : 'bg-gradient-to-br from-orange-400 to-red-500 text-white hover:scale-105 hover:shadow-orange-500/50'}`}
                        >
                            <Hand size={64} className={`sm:w-20 sm:h-20 ${handRaised ? '' : 'animate-wiggle'}`} />
                            <span className="font-black text-xl sm:text-2xl mt-3 sm:mt-4 uppercase tracking-wider">
                                {handRaised ? 'Lower Hand' : 'Raise Hand'}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <p className="text-white/50 text-xs z-10">Bantoto Classrooms Student View</p>
        </div>
    );
}
