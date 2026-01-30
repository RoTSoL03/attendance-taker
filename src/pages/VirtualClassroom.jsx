import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Users, Hand, Trash2, Dices, Shuffle, CheckCircle2 } from 'lucide-react';
import WheelOfNames from '../components/WheelOfNames';
import RandomGrouper from '../components/RandomGrouper';

export default function VirtualClassroom() {
    const { classId } = useParams();
    const [presenceState, setPresenceState] = useState({});
    const [onlineStudents, setOnlineStudents] = useState([]);
    const [students, setStudents] = useState([]); // Database students
    const [handRaises, setHandRaises] = useState([]); // Students with hands raised

    // Tools State
    const [showWheel, setShowWheel] = useState(false);
    const [showGrouper, setShowGrouper] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Derived state for class name (would ideally come from context or fetch)
    const [className, setClassName] = useState('...obtaining class...');

    const channelRef = useRef(null);

    useEffect(() => {
        fetchClassDetails();

        // 1. Subscribe to DB changes (Hands)
        const dbChannel = supabase
            .channel(`db-class-${classId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `class_id=eq.${classId}` }, (payload) => {
                handleDbChange(payload);
            })
            .subscribe();

        // 2. Subscribe to Presence (Who is online)
        // Store in ref so we can broadcast on it
        channelRef.current = supabase.channel(`room:${classId}`, {
            config: {
                presence: {
                    key: 'teacher',
                },
            },
        });

        channelRef.current
            .on('presence', { event: 'sync' }, () => {
                const newState = channelRef.current.presenceState();
                setPresenceState(newState);
                updateOnlineStudents(newState);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Teacher presence tracking
                    await channelRef.current.track({
                        onlineAt: new Date().toISOString(),
                        type: 'teacher'
                    });
                }
            });

        return () => {
            supabase.removeChannel(dbChannel);
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [classId]);

    const fetchClassDetails = async () => {
        // Fetch class name and initial students list
        const { data: cls } = await supabase.from('classes').select('name').eq('id', classId).single();
        if (cls) setClassName(cls.name);

        const { data: studs } = await supabase.from('students').select('*').eq('class_id', classId).order('name');
        if (studs) {
            setStudents(studs);
            setHandRaises(studs.filter(s => s.hand_raised_at).sort((a, b) => new Date(a.hand_raised_at) - new Date(b.hand_raised_at)));
        }
    };

    const handleDbChange = (payload) => {
        // Simple reload for now to keep state consistent, or optimistic updates
        if (payload.eventType === 'UPDATE') {
            // Efficiently update local state
            setStudents(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));

            // Update Hand Raises
            if (payload.new.hand_raised_at) {
                // Add or update
                setHandRaises(prev => {
                    const exists = prev.find(h => h.id === payload.new.id);
                    if (exists) return prev.map(h => h.id === payload.new.id ? payload.new : h).sort((a, b) => new Date(a.hand_raised_at) - new Date(b.hand_raised_at));
                    return [...prev, payload.new].sort((a, b) => new Date(a.hand_raised_at) - new Date(b.hand_raised_at));
                });
            } else {
                // Remove
                setHandRaises(prev => prev.filter(h => h.id !== payload.new.id));
            }
        }
    };

    const updateOnlineStudents = (state) => {
        // Map presence state to a flat list of students
        const presentValues = [];
        Object.values(state).forEach(presences => {
            presences.forEach(p => {
                if (p.studentName) {
                    presentValues.push({
                        name: p.studentName,
                        studentId: p.studentId,
                        joinedAt: p.joinedAt // We will send this from student side
                    });
                }
            });
        });
        // Sort by joinedAt
        setOnlineStudents(presentValues.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)));
    };

    const resetHands = async () => {
        await supabase.rpc('reset_hands', { c_id: classId });
        // The subscription will update the UI
    };

    // Broadcast helpers
    const broadcastEvent = async (event, payload) => {
        if (!channelRef.current) {
            console.warn("Channel not ready for broadcast");
            return;
        }
        await channelRef.current.send({
            type: 'broadcast',
            event: event,
            payload: payload
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden relative">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-3">
                    <Link to={`/class/${classId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>

                    {/* Cloud/Mobile Sidebar Toggle */}
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="md:hidden p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                        <Users size={20} />
                    </button>

                    <div>
                        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate max-w-[150px] sm:max-w-xs">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                            <span className="truncate">{className}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Tools */}
                    <button
                        onClick={() => setShowWheel(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-bold transition-colors text-sm sm:text-base"
                    >
                        <Dices size={18} /> <span className="hidden sm:inline">Wheel</span>
                    </button>
                    <button
                        onClick={() => setShowGrouper(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-bold transition-colors text-sm sm:text-base cursor-pointer"
                    >
                        <Shuffle size={18} /> <span className="hidden sm:inline">Groups</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Presence (Who is here) */}
                {/* Mobile: Absolute overlay. Desktop: Static sidebar */}
                <aside className={`
                    bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out z-10
                    absolute inset-y-0 left-0 w-full sm:w-80 
                    md:static md:translate-x-0
                    ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
                            <Users size={14} /> Only In Class ({onlineStudents.length})
                        </h2>
                        <button onClick={() => setShowMobileSidebar(false)} className="md:hidden p-1 text-gray-400">
                            <ArrowLeft size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {onlineStudents.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Waiting for students to join...</p>
                        ) : (
                            onlineStudents.map((s, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 animate-slide-in-right">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {s.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-700 truncate">{s.name}</span>
                                    <span className="ml-auto text-xs text-gray-400">
                                        {new Date(s.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Center Panel: Interaction & Hand Raises */}
                <section className="flex-1 bg-gray-50 p-8 overflow-y-auto flex flex-col">

                    {/* Hands Raised Area */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Hand className="text-orange-500" /> Raised Hands
                                {handRaises.length > 0 && <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-base">{handRaises.length}</span>}
                            </h2>
                            {handRaises.length > 0 && (
                                <button
                                    onClick={resetHands}
                                    className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 font-bold transition-colors"
                                >
                                    <Trash2 size={16} /> Reset All
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {handRaises.length === 0 ? (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                                    No hands raised yet.
                                </div>
                            ) : (
                                handRaises.map((s, index) => (
                                    <div key={s.id} className={`bg-white p-6 rounded-2xl shadow-sm border-2 ${index === 0 ? 'border-orange-400 ring-4 ring-orange-100' : 'border-gray-100'} flex items-center justify-between relative overflow-hidden group transition-all`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{s.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    +{Math.round((new Date(s.hand_raised_at) - new Date(handRaises[0].hand_raised_at)) / 100) / 10}s
                                                </p>
                                            </div>
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute top-0 right-0 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-bl-xl">
                                                1st
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals with Broadcast Logic */}
            {showWheel && (
                <WheelOfNames
                    students={students}
                    onClose={() => {
                        setShowWheel(false);
                        broadcastEvent('WHEEL_CLOSE', {});
                    }}
                    onSpinStart={() => broadcastEvent('WHEEL_SPIN_START', {})}
                    onSpinEnd={(winner) => broadcastEvent('WHEEL_SPIN_END', { winner })}
                />
            )}

            {showGrouper && (
                <RandomGrouper
                    students={students}
                    onClose={() => {
                        setShowGrouper(false);
                        broadcastEvent('GROUP_CLOSE', {});
                    }}
                    onGroupsGenerated={(groups) => broadcastEvent('GROUPS_GENERATED', { groups })}
                />
            )}
        </div>
    );
}
