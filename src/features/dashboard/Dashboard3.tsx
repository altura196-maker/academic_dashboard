import { type CSSProperties } from 'react';
import { AlertTriangle, BarChart3, BookOpen, LayoutPanelTop, TrendingUp, UserCheck, UserMinus, Users } from 'lucide-react';
import { DashboardHeaderControls } from './components/DashboardHeaderControls';
import { useDashboardActions } from './useDashboardActions';
import { useDashboardData } from './useDashboardData';
import { useDashboardVisualMode } from './useDashboardVisualMode';
import modes from './dashboardModes.module.css';
import styles from './Dashboard3.module.css';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getFillStyle = (percentage: number): CSSProperties => ({
    '--card-fill': `${clampPercent(percentage)}%`
} as CSSProperties);

const getProgressStyle = (percentage: number): CSSProperties => ({
    '--progress': `${clampPercent(percentage)}%`
} as CSSProperties);

const getAttendanceTone = (percentage: number) => {
    if (percentage >= 85) return modes.toneSuccess;
    if (percentage >= 65) return modes.toneInfo;
    if (percentage >= 45) return modes.toneWarning;
    return modes.toneDanger;
};

export const Dashboard3 = () => {
    const {
        stats,
        courseAttendance,
        overallAttendance,
        enrolledShare,
        notEnrolledShare,
        withdrawnShare,
        loadData,
        getCoursePercentStyle
    } = useDashboardData();
    const { mode, setMode } = useDashboardVisualMode();
    const { handleClearData, handleLoadDemoData } = useDashboardActions(loadData);

    return (
        <div className={modes.dashboardModule} data-visual-mode={mode}>
            <div className={modes.dashboardHeaderShell}>
                <div className={modes.dashboardHeader}>
                    <div>
                        <h1 className={modes.dashboardTitle}>Dashboard 3</h1>
                        <p className={modes.dashboardSubtitle}>Split-panel analytics focused on trends and distribution.</p>
                    </div>
                    <DashboardHeaderControls
                        mode={mode}
                        onModeChange={setMode}
                        onLoadDemoData={handleLoadDemoData}
                        onClearData={handleClearData}
                    />
                </div>
            </div>

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
                                    <span className={styles.snapshotLabel}>Total Students</span>
                                    <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.totalStudents}</span>
                                </div>
                                <div className={styles.snapshotRow}>
                                    <span className={styles.snapshotLabel}>Professors</span>
                                    <span className={`${modes.metricValue} ${styles.snapshotValue}`}>{stats.professors}</span>
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

                            <article className={styles.distributionRow}>
                                <div className={styles.distributionHeader}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><UserCheck size={13} /></span>
                                        <span className={modes.metricLabel}>Enrolled</span>
                                    </div>
                                    <div className={styles.distributionValueWrap}>
                                        <span className={modes.metricValue}>{enrolledShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeSuccess}`}>
                                            <span className={modes.metricBadgeText}>{enrolledShare.percentage}%</span>
                                        </span>
                                    </div>
                                </div>
                                <div className={modes.progressTrack}>
                                    <div className={modes.progressFill} style={getProgressStyle(enrolledShare.percentage)} />
                                </div>
                            </article>

                            <article className={styles.distributionRow}>
                                <div className={styles.distributionHeader}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><UserMinus size={13} /></span>
                                        <span className={modes.metricLabel}>Not enrolled</span>
                                    </div>
                                    <div className={styles.distributionValueWrap}>
                                        <span className={modes.metricValue}>{notEnrolledShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeInfo}`}>
                                            <span className={modes.metricBadgeText}>{notEnrolledShare.percentage}%</span>
                                        </span>
                                    </div>
                                </div>
                                <div className={modes.progressTrack}>
                                    <div className={modes.progressFill} style={getProgressStyle(notEnrolledShare.percentage)} />
                                </div>
                            </article>

                            <article className={styles.distributionRow}>
                                <div className={styles.distributionHeader}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><AlertTriangle size={13} /></span>
                                        <span className={modes.metricLabel}>Withdrawn</span>
                                    </div>
                                    <div className={styles.distributionValueWrap}>
                                        <span className={modes.metricValue}>{withdrawnShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeWarning}`}>
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

                <section className={`${modes.dashboardCard} ${modes.toneCourse} ${styles.performanceCard}`} style={getFillStyle(overallAttendance.percentage)}>
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
                                <span className={`${modes.metricBadge} ${modes.badgeInfo}`}>
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

                        {courseAttendance.length === 0 ? (
                            <div className={styles.emptyState}>No attendance records available yet.</div>
                        ) : (
                            <div className={styles.courseList}>
                                {courseAttendance.map(course => (
                                    <article
                                        key={course.courseId}
                                        className={`${modes.dashboardCard} ${modes.toneCourse} ${getAttendanceTone(course.percentage)} ${styles.courseRow}`}
                                        style={{ ...getFillStyle(course.percentage), ...getCoursePercentStyle(course) }}
                                    >
                                        <div className={`${modes.cardBody} ${styles.courseRowBody}`}>
                                            <div className={styles.courseRowTop}>
                                                <div className={modes.metricLabelRow}>
                                                    <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><BookOpen size={13} /></span>
                                                    <h3 className={styles.courseTitle}>{course.courseName}</h3>
                                                </div>
                                                <span className={`${modes.metricBadge} ${modes.badgeCourse}`} style={getCoursePercentStyle(course)}>
                                                    <span className={modes.metricBadgeText}>{course.percentage}%</span>
                                                </span>
                                            </div>
                                            <div className={styles.courseMeta}>
                                                <span className={styles.metaValue}>{course.present}</span>
                                                <span>/</span>
                                                <span className={styles.metaValue}>{course.total}</span>
                                                <span>present</span>
                                            </div>
                                            <div className={modes.progressTrack}>
                                                <div className={modes.progressFill} style={getProgressStyle(course.percentage)} />
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
