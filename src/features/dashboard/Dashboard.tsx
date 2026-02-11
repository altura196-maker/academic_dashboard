import { type CSSProperties } from 'react';
import { AlertTriangle, BookOpen, UserCheck, UserMinus, Users } from 'lucide-react';
import { DashboardHeaderControls } from './components/DashboardHeaderControls';
import { CourseAttendanceCards } from './components/CourseAttendanceCards';
import { DashboardMatrixView } from './Dashboard2';
import { DashboardSplitView } from './Dashboard3';
import { useDashboardActions } from './useDashboardActions';
import { useDashboardData } from './useDashboardData';
import { useDashboardView } from './useDashboardView';
import { useDashboardVisualMode } from './useDashboardVisualMode';
import {
    getDashboardBadgeClassKey,
    getDashboardSeverityClassKey,
    getDashboardToneClassKey,
    getProgressCssVars
} from '../../shared/utils/progressTone';
import modes from './dashboardModes.module.css';
import styles from './Dashboard.module.css';
import type { DashboardViewMode } from './types';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getFillStyle = (percentage: number): CSSProperties => ({
    '--card-fill': `${clampPercent(percentage)}%`,
    ...getProgressCssVars(percentage)
} as CSSProperties);

const getProgressStyle = (percentage: number): CSSProperties => ({
    '--progress': `${clampPercent(percentage)}%`,
    ...getProgressCssVars(percentage)
} as CSSProperties);

const renderExecutiveGrid = (
    data: ReturnType<typeof useDashboardData>
) => {
    const {
        stats,
        courseAttendance,
        enrolledShare,
        notEnrolledShare,
        withdrawnShare
    } = data;
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
                            <article className={`${modes.dashboardCard} ${enrolledToneClass} ${enrolledSeverityClass} ${styles.studentCard}`} style={getFillStyle(enrolledShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><UserCheck size={14} /></span>
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

                            <article className={`${modes.dashboardCard} ${notEnrolledToneClass} ${notEnrolledSeverityClass} ${styles.studentCard}`} style={getFillStyle(notEnrolledShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><UserMinus size={14} /></span>
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

                            <article className={`${modes.dashboardCard} ${withdrawnToneClass} ${withdrawnSeverityClass} ${styles.studentCard}`} style={getFillStyle(withdrawnShare.percentage)}>
                                <div className={`${modes.cardBody} ${styles.studentCardBody}`}>
                                    <div className={modes.metricLabelRow}>
                                        <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><AlertTriangle size={14} /></span>
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

                <CourseAttendanceCards
                    courseAttendance={courseAttendance}
                    getFillStyle={getFillStyle}
                    getProgressStyle={getProgressStyle}
                />
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
                    getFillStyle={getFillStyle}
                    getProgressStyle={getProgressStyle}
                />
            )}
        </div>
    );
};
