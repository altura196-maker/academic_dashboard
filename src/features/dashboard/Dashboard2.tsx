import { LayoutGrid } from 'lucide-react';
import modes from './dashboardModes.module.css';
import styles from './Dashboard2.module.css';
import type { DashboardViewProps } from './types';

const getAttendanceTone = (percentage: number) => {
    if (percentage >= 85) return modes.toneSuccess;
    if (percentage >= 65) return modes.toneInfo;
    if (percentage >= 45) return modes.toneWarning;
    return modes.toneDanger;
};

export const DashboardMatrixView = ({
    stats,
    courseAttendance,
    overallAttendance,
    enrolledShare,
    notEnrolledShare,
    withdrawnShare,
    getCoursePercentStyle,
    getFillStyle,
    getProgressStyle
}: DashboardViewProps) => {
    return (
        <div>
            <section>
                <div className={modes.sectionHeader}>
                    <div>
                        <h2 className={modes.sectionTitle}>KPI Matrix</h2>
                        <p className={modes.sectionSubtitle}>Operational metrics and student distribution in a single grid.</p>
                    </div>
                </div>

                <div className={styles.matrixGrid}>
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

                    <article className={`${modes.dashboardCard} ${modes.toneSuccess} ${styles.metricCard}`} style={getFillStyle(enrolledShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconSuccess}`}><LayoutGrid size={14} /></span>
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

                    <article className={`${modes.dashboardCard} ${modes.toneInfo} ${styles.metricCard}`} style={getFillStyle(notEnrolledShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
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

                    <article className={`${modes.dashboardCard} ${modes.toneWarning} ${styles.metricCard}`} style={getFillStyle(withdrawnShare.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconWarning}`}><LayoutGrid size={14} /></span>
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

                    <article className={`${modes.dashboardCard} ${modes.tonePrimary} ${styles.metricCard}`} style={getFillStyle(0)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Ongoing Courses</p>
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
                                <p className={modes.metricLabel}>Ongoing Sections</p>
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

                    <article className={`${modes.dashboardCard} ${getAttendanceTone(overallAttendance.percentage)} ${styles.metricCard}`} style={getFillStyle(overallAttendance.percentage)}>
                        <div className={`${modes.cardBody} ${styles.metricBody}`}>
                            <div className={modes.metricLabelRow}>
                                <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                <p className={modes.metricLabel}>Avg Attendance</p>
                            </div>
                            <div className={modes.metricValueRow}>
                                <span className={modes.metricValue}>{overallAttendance.percentage}%</span>
                                <span className={`${modes.metricBadge} ${modes.badgeInfo}`}>
                                    <span className={modes.metricBadgeText}>{overallAttendance.total > 0 ? Math.round((overallAttendance.present / overallAttendance.total) * 100) : 0}%</span>
                                </span>
                            </div>
                            <p className={styles.metricMeta}>{overallAttendance.present} / {overallAttendance.total} present records</p>
                        </div>
                    </article>
                </div>
            </section>

            <section>
                <div className={modes.sectionHeader}>
                    <div>
                        <h2 className={modes.sectionTitle}>Attendance Matrix</h2>
                        <p className={modes.sectionSubtitle}>Uniform cards for each course performance.</p>
                    </div>
                </div>

                {courseAttendance.length === 0 ? (
                    <div className={styles.emptyCard}>No attendance records available yet.</div>
                ) : (
                    <div className={styles.courseGrid}>
                        {courseAttendance.map(course => (
                            <article
                                key={course.courseId}
                                className={`${modes.dashboardCard} ${modes.toneCourse} ${styles.courseCard}`}
                                style={{ ...getFillStyle(course.percentage), ...getCoursePercentStyle(course) }}
                            >
                                <div className={`${modes.cardBody} ${styles.courseBody}`}>
                                    <div className={styles.courseTopRow}>
                                        <div className={modes.metricLabelRow}>
                                            <span className={`${modes.metricIcon} ${modes.metricIconInfo}`}><LayoutGrid size={14} /></span>
                                            <h3 className={styles.courseTitle}>{course.courseName}</h3>
                                        </div>
                                        <span className={`${modes.metricBadge} ${modes.badgeCourse}`} style={getCoursePercentStyle(course)}>
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
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
