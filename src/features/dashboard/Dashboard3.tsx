import { AlertTriangle, BarChart3, LayoutPanelTop, UserCheck, UserMinus, Users } from 'lucide-react';
import { CourseAttendanceCards } from './components/CourseAttendanceCards';
import {
    getDashboardBadgeClassKey,
    getDashboardSeverityClassKey,
    getDashboardToneClassKey
} from '../../shared/utils/progressTone';
import modes from './dashboardModes.module.css';
import styles from './Dashboard3.module.css';
import type { DashboardViewProps } from './types';

export const DashboardSplitView = ({
    stats,
    courseAttendance,
    overallAttendance,
    enrolledShare,
    notEnrolledShare,
    withdrawnShare,
    getFillStyle,
    getProgressStyle
}: DashboardViewProps) => {
    const enrolledBadgeClass = modes[getDashboardBadgeClassKey(enrolledShare.percentage)];
    const enrolledSeverityClass = modes[getDashboardSeverityClassKey(enrolledShare.percentage)];
    const notEnrolledBadgeClass = modes[getDashboardBadgeClassKey(notEnrolledShare.percentage)];
    const notEnrolledSeverityClass = modes[getDashboardSeverityClassKey(notEnrolledShare.percentage)];
    const withdrawnBadgeClass = modes[getDashboardBadgeClassKey(withdrawnShare.percentage)];
    const withdrawnSeverityClass = modes[getDashboardSeverityClassKey(withdrawnShare.percentage)];
    const overallToneClass = modes[getDashboardToneClassKey(overallAttendance.percentage)];
    const overallBadgeClass = modes[getDashboardBadgeClassKey(overallAttendance.percentage)];
    const overallSeverityClass = modes[getDashboardSeverityClassKey(overallAttendance.percentage)];

    return (
        <div className={styles.splitGrid}>
            <div className={styles.leftColumn}>
                <section className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.snapshotCard}`} style={getFillStyle(0)}>
                    <div className={`${modes.cardBody} ${styles.snapshotBody}`}>
                        <div className={modes.metricLabelRow}>
                            <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutPanelTop size={14} /></span>
                            <h2 className={styles.panelTitle}>Snapshot</h2>
                        </div>

                        <div className={styles.snapshotList}>
                            <div className={styles.snapshotRow}>
                                <span className={styles.snapshotLabel}>Ongoing Courses</span>
                                <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.activeCourses}</span>
                            </div>
                            <div className={styles.snapshotRow}>
                                <span className={styles.snapshotLabel}>Ongoing Sections</span>
                                <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.activeSections}</span>
                            </div>
                            <div className={styles.snapshotRow}>
                                <span className={styles.snapshotLabel}>Professors</span>
                                <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.professors}</span>
                            </div>
                            <div className={styles.snapshotRow}>
                                <span className={styles.snapshotLabel}>Total Students</span>
                                <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.totalStudents}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${modes.dashboardCard} ${modes.toneInfo} ${styles.distributionCard}`} style={getFillStyle(0)}>
                    <div className={`${modes.cardBody} ${styles.distributionBody}`}>
                        <div className={modes.metricLabelRow}>
                            <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><Users size={14} /></span>
                            <h2 className={styles.panelTitle}>Student Distribution</h2>
                        </div>

                        <article className={`${styles.distributionRow} ${enrolledSeverityClass}`}>
                            <div className={styles.distributionHeader}>
                                <div className={modes.metricLabelRow}>
                                    <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><UserCheck size={13} /></span>
                                    <span className={modes.metricLabel}>Enrolled</span>
                                </div>
                                <div className={styles.distributionValueWrap}>
                                    <span className={modes.metricValue}>{enrolledShare.count}</span>
                                    <span className={`${modes.metricBadge} ${enrolledBadgeClass}`}>
                                        <span className={modes.metricBadgeText}>{enrolledShare.percentage}%</span>
                                    </span>
                                </div>
                            </div>
                            <div className={modes.progressTrack}>
                                <div className={modes.progressFill} style={getProgressStyle(enrolledShare.percentage)} />
                            </div>
                        </article>

                        <article className={`${styles.distributionRow} ${notEnrolledSeverityClass}`}>
                            <div className={styles.distributionHeader}>
                                <div className={modes.metricLabelRow}>
                                    <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><UserMinus size={13} /></span>
                                    <span className={modes.metricLabel}>Not enrolled</span>
                                </div>
                                <div className={styles.distributionValueWrap}>
                                    <span className={modes.metricValue}>{notEnrolledShare.count}</span>
                                    <span className={`${modes.metricBadge} ${notEnrolledBadgeClass}`}>
                                        <span className={modes.metricBadgeText}>{notEnrolledShare.percentage}%</span>
                                    </span>
                                </div>
                            </div>
                            <div className={modes.progressTrack}>
                                <div className={modes.progressFill} style={getProgressStyle(notEnrolledShare.percentage)} />
                            </div>
                        </article>

                        <article className={`${styles.distributionRow} ${withdrawnSeverityClass}`}>
                            <div className={styles.distributionHeader}>
                                <div className={modes.metricLabelRow}>
                                    <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><AlertTriangle size={13} /></span>
                                    <span className={modes.metricLabel}>Withdrawn</span>
                                </div>
                                <div className={styles.distributionValueWrap}>
                                    <span className={modes.metricValue}>{withdrawnShare.count}</span>
                                    <span className={`${modes.metricBadge} ${withdrawnBadgeClass}`}>
                                        <span className={modes.metricBadgeText}>{withdrawnShare.percentage}%</span>
                                    </span>
                                </div>
                            </div>
                            <div className={modes.progressTrack}>
                                <div className={modes.progressFill} style={getProgressStyle(withdrawnShare.percentage)} />
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            <section className={`${modes.dashboardCard} ${overallToneClass} ${overallSeverityClass} ${styles.performanceCard}`} style={getFillStyle(overallAttendance.percentage)}>
                <div className={`${modes.cardBody} ${styles.performanceBody}`}>
                    <div className={styles.performanceHeader}>
                        <div>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><BarChart3 size={14} /></span>
                                <h2 className={styles.panelTitle}>Course Performance</h2>
                            </div>
                            <p className={styles.performanceSubtitle}>Attendance ranking across active courses.</p>
                        </div>
                        <div className={styles.overallWrap}>
                            <span className={styles.overallLabel}>Overall</span>
                            <span className={`${modes.metricBadge} ${overallBadgeClass}`}>
                                <span className={modes.metricBadgeText}>{overallAttendance.percentage}%</span>
                            </span>
                        </div>
                    </div>

                    <div className={styles.performanceMeta}>
                        <span className={styles.metaValue}>{overallAttendance.present}</span>
                        <span>/</span>
                        <span className={styles.metaValue}>{overallAttendance.total}</span>
                        <span>present records</span>
                    </div>

                    <CourseAttendanceCards
                        courseAttendance={courseAttendance}
                        getFillStyle={getFillStyle}
                        getProgressStyle={getProgressStyle}
                        layout="vertical"
                    />
                </div>
            </section>
        </div>
    );
};
