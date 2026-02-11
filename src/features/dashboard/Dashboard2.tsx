import { LayoutGrid } from 'lucide-react';
import { CourseAttendanceCards } from './components/CourseAttendanceCards';
import {
    getDashboardBadgeClassKey,
    getDashboardSeverityClassKey,
    getDashboardToneClassKey
} from '../../shared/utils/progressTone';
import modes from './dashboardModes.module.css';
import styles from './Dashboard2.module.css';
import type { DashboardViewProps } from './types';

export const DashboardMatrixView = ({
    stats,
    courseAttendance,
    overallAttendance,
    enrolledShare,
    notEnrolledShare,
    withdrawnShare,
    getFillStyle,
    getProgressStyle
}: DashboardViewProps) => {
    const overallToneClass = modes[getDashboardToneClassKey(overallAttendance.percentage)];
    const overallBadgeClass = modes[getDashboardBadgeClassKey(overallAttendance.percentage)];
    const overallSeverityClass = modes[getDashboardSeverityClassKey(overallAttendance.percentage)];
    const enrolledToneClass = modes[getDashboardToneClassKey(enrolledShare.percentage)];
    const enrolledBadgeClass = modes[getDashboardBadgeClassKey(enrolledShare.percentage)];
    const enrolledSeverityClass = modes[getDashboardSeverityClassKey(enrolledShare.percentage)];
    const notEnrolledToneClass = modes[getDashboardToneClassKey(notEnrolledShare.percentage)];
    const notEnrolledBadgeClass = modes[getDashboardBadgeClassKey(notEnrolledShare.percentage)];
    const notEnrolledSeverityClass = modes[getDashboardSeverityClassKey(notEnrolledShare.percentage)];
    const withdrawnToneClass = modes[getDashboardToneClassKey(withdrawnShare.percentage)];
    const withdrawnBadgeClass = modes[getDashboardBadgeClassKey(withdrawnShare.percentage)];
    const withdrawnSeverityClass = modes[getDashboardSeverityClassKey(withdrawnShare.percentage)];

    return (
        <div>
            <section>
                <div className={modes.sectionHeader}>
                    <div>
                        <h2 className={modes.sectionTitle}>Course Attendance</h2>
                        <p className={modes.sectionSubtitle}>Current performance by active course sections.</p>
                    </div>
                </div>

                <div className={styles.matrixGrid}>
                    <article className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.metricCard}`} style={getFillStyle(0)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Courses</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={`${modes.metricValue} ${modes.metricValuePill}`}>{stats.activeCourses}</span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.metricCard}`} style={getFillStyle(0)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Sections</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={`${modes.metricValue} ${modes.metricValuePill}`}>{stats.activeSections}</span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.metricCard}`} style={getFillStyle(0)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Professors</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={`${modes.metricValue} ${modes.metricValuePill}`}>{stats.professors}</span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${overallToneClass} ${overallSeverityClass} ${styles.metricCard}`} style={getFillStyle(overallAttendance.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Attendance</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={modes.metricValue}>{overallAttendance.percentage}%</span>
                                <span className={`${modes.metricBadge} ${overallBadgeClass}`}>
                                    <span className={modes.metricBadgeText}>{overallAttendance.percentage}%</span>
                                </span>
                            </div>
                            <p className={styles.metricMeta}>{overallAttendance.present} / {overallAttendance.total} present records</p>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.metricCard}`} style={getFillStyle(0)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Total Students</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={`${modes.metricValue} ${modes.metricValuePill}`}>{stats.totalStudents}</span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${enrolledToneClass} ${enrolledSeverityClass} ${styles.metricCard}`} style={getFillStyle(enrolledShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Enrolled</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={modes.metricValue}>{enrolledShare.count}</span>
                                <span className={`${modes.metricBadge} ${enrolledBadgeClass}`}>
                                    <span className={modes.metricBadgeText}>{enrolledShare.percentage}%</span>
                                </span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${notEnrolledToneClass} ${notEnrolledSeverityClass} ${styles.metricCard}`} style={getFillStyle(notEnrolledShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Not enrolled</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={modes.metricValue}>{notEnrolledShare.count}</span>
                                <span className={`${modes.metricBadge} ${notEnrolledBadgeClass}`}>
                                    <span className={modes.metricBadgeText}>{notEnrolledShare.percentage}%</span>
                                </span>
                            </div>
                        </div>
                    </article>

                    <article className={`${modes.dashboardCard} ${withdrawnToneClass} ${withdrawnSeverityClass} ${styles.metricCard}`} style={getFillStyle(withdrawnShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Withdrawn</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={modes.metricValue}>{withdrawnShare.count}</span>
                                <span className={`${modes.metricBadge} ${withdrawnBadgeClass}`}>
                                    <span className={modes.metricBadgeText}>{withdrawnShare.percentage}%</span>
                                </span>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section>
                <div className={modes.sectionHeader}>
                    <div>
                        <h2 className={modes.sectionTitle}>Course Attendance</h2>
                        <p className={modes.sectionSubtitle}>Current performance by active course sections</p>
                    </div>
                </div>

                <CourseAttendanceCards
                    courseAttendance={courseAttendance}
                    getFillStyle={getFillStyle}
                    getProgressStyle={getProgressStyle}
                />
            </section>
        </div>
    );
};
