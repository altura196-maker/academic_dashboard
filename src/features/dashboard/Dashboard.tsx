import { type CSSProperties } from 'react';
import { AlertTriangle, BookOpen, TrendingUp, UserCheck, UserMinus, Users } from 'lucide-react';
import { DashboardHeaderControls } from './components/DashboardHeaderControls';
import { DashboardMatrixView } from './Dashboard2';
import { DashboardSplitView } from './Dashboard3';
import { useDashboardActions } from './useDashboardActions';
import { useDashboardData } from './useDashboardData';
import { useDashboardView } from './useDashboardView';
import { useDashboardVisualMode } from './useDashboardVisualMode';
import modes from './dashboardModes.module.css';
import styles from './Dashboard.module.css';
import type { DashboardViewMode } from './types';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getFillStyle = (percentage: number): CSSProperties => ({
    '--card-fill': `${clampPercent(percentage)}%`
} as CSSProperties);

const getProgressStyle = (percentage: number): CSSProperties => ({
    '--progress': `${clampPercent(percentage)}%`
} as CSSProperties);

const getCourseToneClass = (percentage: number) => {
    if (percentage >= 85) return modes.toneSuccess;
    if (percentage >= 65) return modes.toneInfo;
    if (percentage >= 45) return modes.toneWarning;
    return modes.toneDanger;
};

const renderExecutiveGrid = (
    data: ReturnType<typeof useDashboardData>
) => {
    const {
        stats,
        courseAttendance,
        enrolledShare,
        notEnrolledShare,
        withdrawnShare,
        getCoursePercentStyle
    } = data;

    return (
        <>
            <div className={styles.topGrid}>
                <section className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.panelCard}`} style={getFillStyle(0)}>
                    <div className={`${modes.cardBody} ${styles.panelBody}`}>
                        <div className={styles.panelHeader}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><BookOpen size={15} /></span>
                                <h2 className={styles.panelTitle}>Overview</h2>
                            </div>
                        </div>

                        <div className={styles.overviewGrid}>
                            <article className={styles.metricTile}>
                                <p className={modes.metricLabel}>Ongoing Courses</p>
                                <p className={`${modes.metricValue} ${styles.overviewValuePlain}`}>{stats.activeCourses}</p>
                            </article>
                            <article className={styles.metricTile}>
                                <p className={modes.metricLabel}>Ongoing Sections</p>
                                <p className={`${modes.metricValue} ${styles.overviewValuePlain}`}>{stats.activeSections}</p>
                            </article>
                            <article className={styles.metricTile}>
                                <p className={modes.metricLabel}>Professors</p>
                                <p className={`${modes.metricValue} ${styles.overviewValuePlain}`}>{stats.professors}</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className={`${modes.dashboardCard} ${modes.toneInfo} ${styles.panelCard}`} style={getFillStyle(0)}>
                    <div className={`${modes.cardBody} ${styles.panelBody}`}>
                        <div className={styles.panelHeader}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><Users size={15} /></span>
                                <h2 className={styles.panelTitle}>Students Overview</h2>
                            </div>
                            <div className={styles.totalWrap}>
                                <span className={styles.totalLabel}>Total</span>
                                <span className={styles.totalValue}>{stats.totalStudents}</span>
                            </div>
                        </div>

                        <div className={styles.studentsGrid}>
                            <article className={`${modes.dashboardCard} ${modes.toneSuccess} ${styles.studentCard}`} style={getFillStyle(enrolledShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><UserCheck size={14} /></span>
                                        <p className={modes.metricLabel}>Enrolled</p>
                                    </div>
                                    <div className={modes.metricValueRow}>
                                        <span className={modes.metricValue}>{enrolledShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeSuccess}`}>
                                            <span className={modes.metricBadgeText}>{enrolledShare.percentage}%</span>
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={`${modes.dashboardCard} ${modes.toneInfo} ${styles.studentCard}`} style={getFillStyle(notEnrolledShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><UserMinus size={14} /></span>
                                        <p className={modes.metricLabel}>Not enrolled</p>
                                    </div>
                                    <div className={modes.metricValueRow}>
                                        <span className={modes.metricValue}>{notEnrolledShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeInfo}`}>
                                            <span className={modes.metricBadgeText}>{notEnrolledShare.percentage}%</span>
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className={`${modes.dashboardCard} ${modes.toneWarning} ${styles.studentCard}`} style={getFillStyle(withdrawnShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><AlertTriangle size={14} /></span>
                                        <p className={modes.metricLabel}>Withdrawn</p>
                                    </div>
                                    <div className={modes.metricValueRow}>
                                        <span className={modes.metricValue}>{withdrawnShare.count}</span>
                                        <span className={`${modes.metricBadge} ${modes.badgeWarning}`}>
                                            <span className={modes.metricBadgeText}>{withdrawnShare.percentage}%</span>
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>
            </div>

            <section className={styles.attendanceSection}>
                <div className={modes.sectionHeader}>
                    <div>
                        <h2 className={modes.sectionTitle}>Course Attendance</h2>
                        <p className={modes.sectionSubtitle}>Current performance by active course sections.</p>
                    </div>
                </div>

                {courseAttendance.length === 0 ? (
                    <div className={styles.emptyCard}>No attendance records available yet.</div>
                ) : (
                    <div className={styles.attendanceGrid}>
                        {courseAttendance.map(course => (
                            <article
                                key={course.courseId}
                                className={`${modes.dashboardCard} ${modes.toneCourse} ${getCourseToneClass(course.percentage)} ${styles.courseCard}`}
                                style={{ ...getFillStyle(course.percentage), ...getCoursePercentStyle(course) }}
                            >
                                <div className={`${modes.cardBody} ${styles.courseBody}`}>
                                    <div className={styles.courseHeader}>
                                        <div>
                                            <div className={modes.metricLabelRow}>
                                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><TrendingUp size={14} /></span>
                                                <h3 className={styles.courseTitle}>{course.courseName}</h3>
                                            </div>
                                            <p className={styles.courseMeta}>
                                                <span className={styles.courseMetaValue}>{course.present}</span>
                                                <span>/</span>
                                                <span className={styles.courseMetaValue}>{course.total}</span>
                                                <span>present</span>
                                            </p>
                                        </div>
                                        <span className={`${modes.metricBadge} ${modes.badgeCourse}`} style={getCoursePercentStyle(course)}>
                                            <span className={modes.metricBadgeText}>{course.percentage}%</span>
                                        </span>
                                    </div>
                                    <div className={modes.progressTrack}>
                                        <div className={modes.progressFill} style={getProgressStyle(course.percentage)} />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

const getViewTitle = (view: DashboardViewMode) => {
    if (view === 'matrix') return 'Card Matrix';
    if (view === 'split') return 'Split Panels';
    return 'Executive Grid';
};

export const Dashboard = () => {
    const data = useDashboardData();
    const { mode, setMode } = useDashboardVisualMode();
    const { view, setView } = useDashboardView();
    const { handleClearData, handleLoadDemoData } = useDashboardActions(data.loadData);

    const viewTitle = getViewTitle(view);

    return (
        <div className={modes.dashboardModule} data-visual-mode={mode}>
            <div className={modes.dashboardHeaderShell}>
                <div className={modes.dashboardHeader}>
                    <div>
                        <h1 className={modes.dashboardTitle}>Dashboard</h1>
                        <p className={modes.dashboardSubtitle}>View: {viewTitle}</p>
                    </div>
                    <DashboardHeaderControls
                        mode={mode}
                        onModeChange={setMode}
                        view={view}
                        onViewChange={setView}
                        onLoadDemoData={handleLoadDemoData}
                        onClearData={handleClearData}
                    />
                </div>
            </div>

            {view === 'executive' && renderExecutiveGrid(data)}
            {view === 'matrix' && (
                <DashboardMatrixView
                    stats={data.stats}
                    courseAttendance={data.courseAttendance}
                    overallAttendance={data.overallAttendance}
                    enrolledShare={data.enrolledShare}
                    notEnrolledShare={data.notEnrolledShare}
                    withdrawnShare={data.withdrawnShare}
                    getCoursePercentStyle={data.getCoursePercentStyle}
                    getFillStyle={getFillStyle}
                    getProgressStyle={getProgressStyle}
                />
            )}
            {view === 'split' && (
                <DashboardSplitView
                    stats={data.stats}
                    courseAttendance={data.courseAttendance}
                    overallAttendance={data.overallAttendance}
                    enrolledShare={data.enrolledShare}
                    notEnrolledShare={data.notEnrolledShare}
                    withdrawnShare={data.withdrawnShare}
                    getCoursePercentStyle={data.getCoursePercentStyle}
                    getFillStyle={getFillStyle}
                    getProgressStyle={getProgressStyle}
                />
            )}
        </div>
    );
};
