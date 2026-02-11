import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { StorageService } from '../../shared/utils/storage';

export interface DashboardStats {
    activeCourses: number;
    activeSections: number;
    totalStudents: number;
    enrolledStudents: number;
    withdrawnStudents: number;
    notEnrolledStudents: number;
    professors: number;
}

export interface CourseAttendanceStats {
    courseId: string;
    courseName: string;
    present: number;
    total: number;
    percentage: number;
}

export interface StudentShare {
    count: number;
    percentage: number;
}

const getToday = () => new Date().toISOString().split('T')[0];

const getCourseHue = (courseKey: string) => {
    let hash = 0;
    for (let i = 0; i < courseKey.length; i += 1) {
        hash = courseKey.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
};

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats>({
        activeCourses: 0,
        activeSections: 0,
        totalStudents: 0,
        enrolledStudents: 0,
        withdrawnStudents: 0,
        notEnrolledStudents: 0,
        professors: 0
    });
    const [courseAttendance, setCourseAttendance] = useState<CourseAttendanceStats[]>([]);

    const loadData = useCallback(() => {
        const courses = StorageService.getCourses();
        const students = StorageService.getStudents();
        const professors = StorageService.getProfessors();
        const sections = StorageService.getSections();
        const attendance = StorageService.getAttendance();

        const today = getToday();

        const activeSections = sections.filter(section => {
            if (!section.startDate || !section.endDate) return true;
            return section.startDate <= today && section.endDate >= today;
        });
        const activeSectionIds = new Set(activeSections.map(section => section.id));

        const activeCourseIds = new Set(
            sections.filter(section => activeSectionIds.has(section.id)).map(section => section.courseId)
        );

        const studentStatusCounts = students.reduce((acc, student) => {
            const status = StorageService.getStudentEnrollmentStatus(student.id, today);
            if (status === 'enrolled') acc.enrolled += 1;
            else if (status === 'withdrawn') acc.withdrawn += 1;
            else acc.notEnrolled += 1;
            return acc;
        }, { enrolled: 0, withdrawn: 0, notEnrolled: 0 });

        setStats({
            activeCourses: activeCourseIds.size,
            activeSections: activeSections.length,
            totalStudents: students.length,
            enrolledStudents: studentStatusCounts.enrolled,
            withdrawnStudents: studentStatusCounts.withdrawn,
            notEnrolledStudents: studentStatusCounts.notEnrolled,
            professors: professors.length
        });

        const courseAttendanceMap = new Map<string, { present: number; total: number }>();

        courses.forEach(course => {
            const courseSections = activeSections.filter(section => section.courseId === course.id);
            let totalPresent = 0;
            let totalRecords = 0;

            courseSections.forEach(section => {
                const sectionAttendance = attendance.filter(record => record.sectionId === section.id);
                sectionAttendance.forEach(record => {
                    const activeRecords = record.records.filter(item =>
                        StorageService.getEffectiveStudentStatus(item.studentId, section.id)
                    );
                    totalRecords += activeRecords.length;
                    totalPresent += activeRecords.filter(item => item.present).length;
                });
            });

            if (totalRecords > 0) {
                courseAttendanceMap.set(course.id, { present: totalPresent, total: totalRecords });
            }
        });

        const attendanceStats: CourseAttendanceStats[] = courses
            .map(course => {
                const courseStats = courseAttendanceMap.get(course.id);
                if (!courseStats) return null;
                return {
                    courseId: course.id,
                    courseName: course.name,
                    present: courseStats.present,
                    total: courseStats.total,
                    percentage: Math.round((courseStats.present / courseStats.total) * 100)
                };
            })
            .filter((item): item is CourseAttendanceStats => item !== null)
            .sort((a, b) => b.percentage - a.percentage);

        setCourseAttendance(attendanceStats);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getStudentShare = useCallback((count: number): StudentShare => {
        const total = stats.totalStudents;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return { count, percentage };
    }, [stats.totalStudents]);

    const enrolledShare = getStudentShare(stats.enrolledStudents);
    const notEnrolledShare = getStudentShare(stats.notEnrolledStudents);
    const withdrawnShare = getStudentShare(stats.withdrawnStudents);

    const overallAttendance = useMemo(() => {
        const totalPresent = courseAttendance.reduce((sum, course) => sum + course.present, 0);
        const totalRecords = courseAttendance.reduce((sum, course) => sum + course.total, 0);
        const percentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
        return {
            present: totalPresent,
            total: totalRecords,
            percentage
        };
    }, [courseAttendance]);

    const getCoursePercentStyle = useCallback((course: CourseAttendanceStats): CSSProperties => ({
        '--course-h': `${getCourseHue(`${course.courseId}:${course.courseName}`)}`
    } as CSSProperties), []);

    return {
        stats,
        courseAttendance,
        overallAttendance,
        enrolledShare,
        notEnrolledShare,
        withdrawnShare,
        loadData,
        getStudentShare,
        getCoursePercentStyle
    };
};
