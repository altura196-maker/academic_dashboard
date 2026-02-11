import type { CSSProperties } from 'react';
import type { CourseAttendanceStats, DashboardStats, StudentShare } from './useDashboardData';

export type DashboardViewMode = 'executive' | 'matrix' | 'split';

export interface DashboardViewProps {
    stats: DashboardStats;
    courseAttendance: CourseAttendanceStats[];
    overallAttendance: {
        present: number;
        total: number;
        percentage: number;
    };
    enrolledShare: StudentShare;
    notEnrolledShare: StudentShare;
    withdrawnShare: StudentShare;
    getCoursePercentStyle: (course: CourseAttendanceStats) => CSSProperties;
    getFillStyle: (percentage: number) => CSSProperties;
    getProgressStyle: (percentage: number) => CSSProperties;
}
