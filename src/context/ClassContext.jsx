import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ClassContext = createContext();

export function useClasses() {
    return useContext(ClassContext);
}

export function ClassProvider({ children }) {
    const [classes, setClasses] = useState(() => {
        const saved = localStorage.getItem('attendance_classes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('attendance_classes', JSON.stringify(classes));
    }, [classes]);

    const addClass = (name) => {
        setClasses([...classes, {
            id: uuidv4(),
            name,
            students: [],
            attendance: {}
        }]);
    };

    const deleteClass = (id) => {
        setClasses(classes.filter(c => c.id !== id));
    };

    const addStudent = (classId, studentName) => {
        setClasses(classes.map(c => {
            if (c.id === classId) {
                return {
                    ...c,
                    students: [...c.students, { id: uuidv4(), name: studentName }]
                };
            }
            return c;
        }));
    };

    const removeStudent = (classId, studentId) => {
        setClasses(classes.map(c => {
            if (c.id === classId) {
                return {
                    ...c,
                    students: c.students.filter(s => s.id !== studentId)
                };
            }
            return c;
        }));
    };

    const updateAttendance = (classId, date, studentId, status) => {
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
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(classes, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "attendance_data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const value = {
        classes,
        addClass,
        deleteClass,
        addStudent,
        removeStudent,
        updateAttendance,
        exportData
    };

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
}
