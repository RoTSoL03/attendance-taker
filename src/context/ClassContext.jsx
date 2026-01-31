/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const ClassContext = createContext();

export function useClasses() {
    return useContext(ClassContext);
}

export function ClassProvider({ children }) {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchClasses();
        } else {
            setClasses([]);
            setLoading(false);
        }
    }, [user]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select(`
                    *,
                    students (*),
                    attendance (*)
                `)
                .order('created_at', { ascending: true });

            if (classesError) throw classesError;

            // Transform data to match application structure
            const formattedClasses = classesData.map(cls => {
                // Transform attendance array to object: { [date]: { [studentId]: status } }
                const attendanceObj = {};
                if (cls.attendance) {
                    cls.attendance.forEach(record => {
                        if (!attendanceObj[record.date]) {
                            attendanceObj[record.date] = {};
                        }
                        attendanceObj[record.date][record.student_id] = record.status;
                    });
                }

                return {
                    ...cls,
                    students: cls.students || [],
                    attendance: attendanceObj
                };
            });

            setClasses(formattedClasses);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addClass = async (name) => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .insert([{ user_id: user.id, name }])
                .select()
                .single();

            if (error) throw error;

            setClasses([...classes, {
                ...data,
                students: [],
                attendance: {}
            }]);
        } catch (error) {
            console.error('Error adding class:', error.message);
        }
    };

    const deleteClass = async (id) => {
        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setClasses(classes.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting class:', error.message);
        }
    };

    const addStudent = async (classId, studentName) => {
        try {
            const { data, error } = await supabase
                .from('students')
                .insert([{ class_id: classId, name: studentName }])
                .select()
                .single();

            if (error) throw error;

            setClasses(classes.map(c => {
                if (c.id === classId) {
                    return {
                        ...c,
                        students: [...c.students, data]
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error('Error adding student:', error.message);
        }
    };

    const removeStudent = async (classId, studentId) => {
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', studentId);

            if (error) throw error;

            setClasses(classes.map(c => {
                if (c.id === classId) {
                    return {
                        ...c,
                        students: c.students.filter(s => s.id !== studentId)
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error('Error removing student:', error.message);
        }
    };

    const updateAttendance = async (classId, date, studentId, status) => {
        // Optimistic update
        setClasses(classes.map(c => {
            if (c.id === classId) {
                const dateRecord = c.attendance[date] || {};
                return {
                    ...c,
                    attendance: {
                        ...c.attendance,
                        [date]: {
                            ...dateRecord,
                            [studentId]: status
                        }
                    }
                };
            }
            return c;
        }));

        try {
            const { error } = await supabase
                .from('attendance')
                .upsert({
                    class_id: classId,
                    student_id: studentId,
                    date,
                    status
                }, {
                    onConflict: 'class_id, student_id, date'
                });

            if (error) {
                throw error;
                // Revert optimistic update? For now just log error.
            }
        } catch (error) {
            console.error('Error updating attendance:', error.message);
            // In a real app we should revert the optimistic update here
        }
    };

    const generateClassCode = async (classId) => {
        const code = nanoid();
        console.log(`Generating code ${code} for class ${classId}`);
        try {
            const { error } = await supabase
                .from('classes')
                .update({ join_code: code })
                .eq('id', classId)
                .select()
                .single();

            if (error) {
                console.error('Supabase Update Error:', error);
                throw error;
            }

            setClasses(classes.map(c =>
                c.id === classId ? { ...c, join_code: code } : c
            ));
            return code;
        } catch (error) {
            console.error('Error generating class code:', error.message);
            return null;
        }
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classes, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "attendance_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const value = {
        classes,
        loading,
        addClass,
        deleteClass,
        addStudent,
        removeStudent,
        updateAttendance,
        exportData,
        generateClassCode
    };

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
}
