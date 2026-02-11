import { LayoutGrid } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { CourseAttendanceStats } from '../useDashboardData';
import {
    getDashboardBadgeClassKey,
    getDashboardSeverityClassKey,
    getDashboardToneClassKey
} from '../../../shared/utils/progressTone';
import modes from '../dashboardModes.module.css';
import styles from './CourseAttendanceCards.module.css';

interface CourseAttendanceCardsProps {
    courseAttendance: CourseAttendanceStats[];
    getFillStyle: (percentage: number) => CSSProperties;
    getProgressStyle: (percentage: number) => CSSProperties;
    layout?: 'grid' | 'vertical';
}

export const CourseAttendanceCards = ({
    courseAttendance,
    getFillStyle,
    getProgressStyle,
    layout = 'grid'
}: CourseAttendanceCardsProps) => {
    if (courseAttendance.length === 0) {
        return <div className={styles.emptyCard}>No attendance records available yet.</div>;
    }

    return (
        <div className={layout === 'vertical' ? styles.courseList : styles.courseGrid}>
            {courseAttendance.map(course => {
                const toneClass = modes[getDashboardToneClassKey(course.percentage)];
                const badgeClass = modes[getDashboardBadgeClassKey(course.percentage)];
                const severityClass = modes[getDashboardSeverityClassKey(course.percentage)];

                return (
                    <article
                        key={course.courseId}
                        className={`${modes.dashboardCard} ${toneClass} ${severityClass} ${styles.courseCard}`}
                        style={getFillStyle(course.percentage)}
                    >
                        <div className={`${modes.cardBody} ${styles.courseBody}`}>
                            <div className={styles.courseTopRow}>
                                <div className={modes.metricLabelRow}>
                                    <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                    <h3 className={styles.courseTitle}>{course.courseName}</h3>
                                </div>
                                <span className={`${modes.metricBadge} ${badgeClass}`}>
                                    <span className={modes.metricBadgeText}>{course.percentage}%</span>
                                </span>
                            </div>
                            <div className={styles.courseMetaRow}>
                                <span className={styles.courseMetaValue}>{course.present}</span>
                                <span>/</span>
                                <span className={styles.courseMetaValue}>{course.total}</span>
                                <span>present</span>
                            </div>
                            <div className={modes.progressTrack}>
                                <div className={modes.progressFill} style={getProgressStyle(course.percentage)} />
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};
