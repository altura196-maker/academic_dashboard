import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StorageService } from '../../shared/utils/storage';
import { Student, Section, Attendance, Enrollment } from '../../shared/utils/types';
import { Button } from '../../shared/components/Button';
import { Modal } from '../../shared/components/Modal';
import { Input, Select } from '../../shared/components/Input';
import { Pencil, Trash2, Plus, ClipboardList, ChevronDown, ChevronRight, DollarSign, Users, UserCheck, UserX, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';
import { PaymentsModule } from '../payments';
import { useConfirmation } from '../../shared/hooks/useConfirmation';
import styles from './StudentsModule.module.css';

interface StudentsModuleProps {
    sectionId?: string;
    courseId?: string;
    hideHeader?: boolean;
}

import { PageHeader } from '../../shared/components/PageHeader';

export const StudentsModule = ({ sectionId, courseId, hideHeader = false }: StudentsModuleProps) => {
    const { showConfirmation } = useConfirmation();
    // Data
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        sex: '' as 'Male' | 'Female' | 'Other' | ''
    });

    // UI: Search / Filters / Sorting / Pagination / Selection
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const [sortBy, setSortBy] = useState<'name' | 'email' | 'attendance' | ''>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(25);
    const [pageSizeInput, setPageSizeInput] = useState<string>(String(25));

    useEffect(() => {
        setPage(1);
        setSelectedIds({});
    }, [pageSize]);

    useEffect(() => {
        // keep input in sync when pageSize is changed programmatically
        setPageSizeInput(String(pageSize));
    }, [pageSize]);

    const handlePageSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setPageSizeInput(v);
        const n = parseInt(v, 10);
        if (Number.isInteger(n) && n > 0) {
            setPageSize(n);
        }
    };

    const handlePageSizeBlur = () => {
        const n = parseInt(pageSizeInput, 10);
        if (!Number.isInteger(n) || n <= 0) {
            setPageSize(10);
            setPageSizeInput('10');
        }
    };

    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadData();
    }, [sectionId, courseId]);

    useEffect(() => {
        setPage(1);
        setSelectedIds({});
    }, [filterActive, sortBy, sortDir]);

    const formatStudentName = (name: string) => {
        const parts = name.split(' ');
        if (parts.length <= 1) return name;
        const last = parts[parts.length - 1];
        const first = parts.slice(0, -1).join(' ');
        return `${last} ${first}`;
    };

    const loadData = () => {
        let allStudents = StorageService.getStudents();
        const allEnrollments = StorageService.getEnrollments();

        if (sectionId) {
            const sectionEnrollments = allEnrollments.filter(e => e.sectionId === sectionId);
            allStudents = allStudents.filter(s => sectionEnrollments.some(e => e.studentId === s.id));
        } else if (courseId) {
            const courseEnrollments = allEnrollments.filter(e => e.courseId === courseId);
            allStudents = allStudents.filter(s => courseEnrollments.some(e => e.studentId === s.id));
        }

        const sortedStudents = [...allStudents].sort((a, b) => {
            return formatStudentName(a.name).localeCompare(formatStudentName(b.name));
        });

        setStudents(sortedStudents);
        setSections(StorageService.getSections());
        setAttendanceData(StorageService.getAttendance());
        setEnrollments(allEnrollments);
    };

    const handleOpenModal = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                phone: student.phone,
                birthDate: student.birthDate || '',
                sex: student.sex || ''
            });
        } else {
            setEditingStudent(null);
            setFormData({ name: '', email: '', phone: '', birthDate: '', sex: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        setFormData({ name: '', email: '', phone: '', birthDate: '', sex: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            // simple validation
            return;
        }

        const studentData = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            birthDate: formData.birthDate || undefined,
            sex: formData.sex as 'Male' | 'Female' | 'Other' | undefined
        };

        if (editingStudent) {
            StorageService.updateStudent({ ...editingStudent, ...studentData });
        } else {
            StorageService.addStudent({
                id: crypto.randomUUID(),
                ...studentData
            });
        }
        loadData();
        handleCloseModal();
    };

    const handleDeactivateFromTrash = async (student: Student) => {
        const confirmed = await showConfirmation({
            title: 'Mark Student Withdrawn?',
            message: `Are you sure you want to mark "${student.name}" as withdrawn?`,
            confirmLabel: 'Mark withdrawn',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;
        StorageService.addStudentStatusHistory({
            id: crypto.randomUUID(),
            studentId: student.id,
            isActive: false,
            changedAt: new Date().toISOString()
        });
        const enrollmentsForStudent = StorageService.getEnrollments().filter(e => e.studentId === student.id);
        enrollmentsForStudent.forEach(e => {
            StorageService.addSectionStudentStatusHistory({
                id: crypto.randomUUID(),
                studentId: student.id,
                sectionId: e.sectionId,
                isActive: false,
                changedAt: new Date().toISOString()
            });
        });
        loadData();
    };

    const handleToggleGlobalStatus = async (student: Student) => {
        const isActive = StorageService.getStudentActiveStatus(student.id);
        const confirmed = await showConfirmation({
            title: isActive ? 'Mark Student Withdrawn?' : 'Mark Student Enrolled?',
            message: `Are you sure you want to ${isActive ? 'mark' : 'set'} "${student.name}" ${isActive ? 'withdrawn' : 'enrolled'}?`,
            confirmLabel: isActive ? 'Mark withdrawn' : 'Mark enrolled',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;
        StorageService.addStudentStatusHistory({
            id: crypto.randomUUID(),
            studentId: student.id,
            isActive: !isActive,
            changedAt: new Date().toISOString()
        });
        if (isActive) {
            const enrollmentsForStudent = StorageService.getEnrollments().filter(e => e.studentId === student.id);
            enrollmentsForStudent.forEach(e => {
                StorageService.addSectionStudentStatusHistory({
                    id: crypto.randomUUID(),
                    studentId: student.id,
                    sectionId: e.sectionId,
                    isActive: false,
                    changedAt: new Date().toISOString()
                });
            });
        }
        loadData();
    };

    const handleToggleSectionStatus = async (student: Student, section: Section) => {
        const isActive = StorageService.getSectionStudentActiveStatus(student.id, section.id);
        const confirmed = await showConfirmation({
            title: isActive ? 'Mark Student Withdrawn?' : 'Mark Student Enrolled?',
            message: `Are you sure you want to ${isActive ? 'mark' : 'set'} "${student.name}" ${isActive ? 'withdrawn' : 'enrolled'} in "${section.name}"?`,
            confirmLabel: isActive ? 'Mark withdrawn' : 'Mark enrolled',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;
        StorageService.addSectionStudentStatusHistory({
            id: crypto.randomUUID(),
            studentId: student.id,
            sectionId: section.id,
            isActive: !isActive,
            changedAt: new Date().toISOString()
        });
        loadData();
    };

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getAttendanceStatus = (percent: number) => {
        if (percent >= 75) return 'high';
        if (percent >= 50) return 'mid';
        return 'low';
    };

    const getStudentOverallAttendance = useCallback((studentId: string) => {
        const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
        if (studentEnrollments.length === 0) return { percent: 0, present: 0, total: 0 };

        let totalPresent = 0;
        let totalStudentRecords = 0;

        studentEnrollments.forEach(enrollment => {
            if (!StorageService.getEffectiveStudentStatus(studentId, enrollment.sectionId)) return;
            const sectionRecords = attendanceData.filter(a => a.sectionId === enrollment.sectionId);
            sectionRecords.forEach(record => {
                const studentRecord = record.records.find(r => r.studentId === studentId);
                if (studentRecord) {
                    totalStudentRecords++;
                    if (studentRecord.present) {
                        totalPresent++;
                    }
                }
            });
        });

        const percent = totalStudentRecords > 0 ? Math.round((totalPresent / totalStudentRecords) * 100) : 0;
        return { percent, present: totalPresent, total: totalStudentRecords };
    }, [attendanceData, enrollments]);

    const studentInsights = useMemo(() => {
        const enrolledIds = students.filter(s => StorageService.getStudentActiveStatus(s.id)).map(s => s.id);
        const withdrawnCount = Math.max(students.length - enrolledIds.length, 0);
        const avgCourses = students.length > 0 ? (enrollments.length / students.length) : 0;
        const attendanceSamples = enrolledIds.map(id => getStudentOverallAttendance(id).percent).filter(p => p > 0);
        const avgAttendance = attendanceSamples.length > 0
            ? Math.round(attendanceSamples.reduce((a, b) => a + b, 0) / attendanceSamples.length)
            : 0;

        return {
            totalStudents: students.length,
            enrolledCount: enrolledIds.length,
            withdrawnCount,
            avgCourses: Number(avgCourses.toFixed(1)),
            avgAttendance
        };
    }, [students, enrollments, getStudentOverallAttendance]);

    const getStudentMetrics = (studentId: string) => {
        const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
        const studentSections = sections.filter(s => studentEnrollments.some(e => e.sectionId === s.id));

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const activeSections = studentSections.filter(s => {
            if (!s.endDate) return true;
            return s.endDate >= today;
        });

        const finishedSections = studentSections.filter(s => {
            if (!s.endDate) return false;
            return s.endDate < today;
        });

        const calcAttendance = (sectionId: string) => {
            if (!StorageService.getEffectiveStudentStatus(studentId, sectionId)) {
                return { percent: 0, present: 0, total: 0 };
            }
            const sectionRecords = attendanceData.filter(a => a.sectionId === sectionId);
            const totalClasses = sectionRecords.length;
            if (totalClasses === 0) return { percent: 0, present: 0, total: 0 };

            let presentCount = 0;
            sectionRecords.forEach(record => {
                const studentRecord = record.records.find(r => r.studentId === studentId);
                if (studentRecord && studentRecord.present) {
                    presentCount++;
                }
            });

            return {
                percent: Math.round((presentCount / totalClasses) * 100),
                present: presentCount,
                total: totalClasses
            };
        };

        return { activeSections, finishedSections, calcAttendance };
    };

    const toggleStudentExpand = (studentId: string) => {
        setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    // UI helpers
    const visibleStudents = useMemo(() => {
        let out = [...students];

        if (filterActive === 'active') {
            out = out.filter(s => StorageService.getStudentActiveStatus(s.id));
        } else if (filterActive === 'inactive') {
            out = out.filter(s => !StorageService.getStudentActiveStatus(s.id));
        }

        if (sortBy) {
            out.sort((a, b) => {
                if (sortBy === 'name') {
                    const ra = formatStudentName(a.name);
                    const rb = formatStudentName(b.name);
                    return sortDir === 'asc' ? ra.localeCompare(rb) : rb.localeCompare(ra);
                }
                if (sortBy === 'email') {
                    return sortDir === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
                }
                if (sortBy === 'attendance') {
                    const aa = getStudentOverallAttendance(a.id).percent;
                    const ab = getStudentOverallAttendance(b.id).percent;
                    return sortDir === 'asc' ? aa - ab : ab - aa;
                }
                return 0;
            });
        }

        return out;
    }, [students, filterActive, sortBy, sortDir, enrollments, attendanceData]);

    const totalPages = Math.max(1, Math.ceil(visibleStudents.length / pageSize));
    const pageStudents = visibleStudents.slice((page - 1) * pageSize, page * pageSize);

    const getPageWindow = () => {
        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, page + 2);
        const windowSize = 5;
        if (end - start + 1 < windowSize) {
            const missing = windowSize - (end - start + 1);
            start = Math.max(1, start - missing);
            end = Math.min(totalPages, start + windowSize - 1);
            if (end - start + 1 < windowSize) {
                start = Math.max(1, end - windowSize + 1);
            }
        }
        return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    };

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const toggleSelect = (id: string, checked?: boolean) => {
        setSelectedIds(prev => ({ ...prev, [id]: typeof checked === 'boolean' ? checked : !prev[id] }));
    };

    const toggleSelectAllOnPage = (checked: boolean) => {
        const next = { ...selectedIds };
        pageStudents.forEach(s => (next[s.id] = checked));
        setSelectedIds(next);
    };

    const selectedCount = Object.values(selectedIds).filter(Boolean).length;

    const changeSort = (by: typeof sortBy) => {
        if (sortBy === by) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(by);
            setSortDir('asc');
        }
    };

    const exportCSV = (rows: Student[]) => {
        const headers = ['Name', 'Email', 'Phone', 'Birth Date', 'Sex'];
        const body = rows.map(r => [r.name, r.email, r.phone, r.birthDate || '', r.sex || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...body].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const bulkChangeStatus = async (active: boolean) => {
        if (selectedCount === 0) return;
        const confirmed = await showConfirmation({
            title: active ? 'Mark Selected Enrolled?' : 'Mark Selected Withdrawn?',
            message: `Are you sure you want to ${active ? 'enroll' : 'withdraw'} ${selectedCount} selected students?`,
            confirmLabel: active ? 'Enroll' : 'Withdraw',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;
        Object.entries(selectedIds).forEach(([id, sel]) => {
            if (!sel) return;
            StorageService.addStudentStatusHistory({ id: crypto.randomUUID(), studentId: id, isActive: active, changedAt: new Date().toISOString() });
        });
        setSelectedIds({});
        loadData();
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 0) return '—';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div>
            {!hideHeader && (
                <PageHeader
                    title={
                        <>
                            Students <span className={styles.countBadge}>({students.length})</span>
                        </>
                    }
                    actions={
                        <div className={styles.headerActions}>
                            <Button variant="secondary" onClick={() => exportCSV(visibleStudents)} aria-label="Export CSV">
                                Export
                            </Button>
                            <Button onClick={() => handleOpenModal()}>
                                <Plus size={16} className={styles.buttonIcon} /> Add Student
                            </Button>
                        </div>
                    }
                />
            )}

            <div className={styles.insightsGrid}>
                <div className={styles.insightCard}>
                    <div className={styles.insightIcon} data-tone="primary">
                        <Users size={18} />
                    </div>
                    <div>
                        <div className={styles.insightLabel}>Total Students</div>
                        <div className={styles.insightValue}>{studentInsights.totalStudents}</div>
                    </div>
                </div>
                <div className={styles.insightCard}>
                    <div className={styles.insightIcon} data-tone="success">
                        <UserCheck size={18} />
                    </div>
                    <div>
                        <div className={styles.insightLabel}>Enrolled</div>
                        <div className={styles.insightValue}>{studentInsights.enrolledCount}</div>
                    </div>
                </div>
                <div className={styles.insightCard}>
                    <div className={styles.insightIcon} data-tone="warning">
                        <UserX size={18} />
                    </div>
                    <div>
                        <div className={styles.insightLabel}>Withdrawn</div>
                        <div className={styles.insightValue}>{studentInsights.withdrawnCount}</div>
                    </div>
                </div>
                <div className={styles.insightCard}>
                    <div className={styles.insightIcon} data-tone="info">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <div className={styles.insightLabel}>Avg Attendance</div>
                        <div className={styles.insightValue}>{studentInsights.avgAttendance}%</div>
                    </div>
                </div>
                <div className={styles.insightCard}>
                    <div className={styles.insightIcon} data-tone="accent">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <div className={styles.insightLabel}>Courses / Student</div>
                        <div className={styles.insightValue}>{studentInsights.avgCourses}</div>
                    </div>
                </div>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.chipGroup} role="group" aria-label="Filter by enrollment status">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'active', label: 'Enrolled' },
                        { key: 'inactive', label: 'Withdrawn' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            type="button"
                            className={`${styles.filterChip} ${filterActive === opt.key ? styles.filterChipActive : ''}`}
                            onClick={() => setFilterActive(opt.key as any)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableTopBar}>
                    <div className={styles.topBarLeft}>
                        <Button size="sm" variant="success" className={styles.bulkActionButton} onClick={() => bulkChangeStatus(true)} disabled={!selectedCount}>Enroll Selected</Button>
                        <Button size="sm" variant="danger" className={styles.bulkActionButton} onClick={() => bulkChangeStatus(false)} disabled={!selectedCount}>Withdraw Selected</Button>
                        <div className={styles.topBarInfo}>{selectedCount} selected</div>
                    </div>
                    <div className={styles.topBarRight}>
                        <div className={styles.pagination}>
                            <div className={styles.rowsControl}>
                                <label htmlFor="rows-per-page" className={styles.rowsLabel}>Rows:</label>
                                <input
                                    id="rows-per-page"
                                    type="number"
                                    min={1}
                                    list="rows-options"
                                    value={pageSizeInput}
                                    onChange={handlePageSizeInputChange}
                                    onBlur={handlePageSizeBlur}
                                    className={styles.rowsInput}
                                    aria-label="Rows per page"
                                />
                                <datalist id="rows-options">
                                    <option value="5" />
                                    <option value="10" />
                                    <option value="25" />
                                    <option value="50" />
                                    <option value="100" />
                                </datalist>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                            <div className={styles.pageNumbers}>
                                {getPageWindow().map(p => (
                                    p === page ? (
                                        <select
                                            key="page-select"
                                            className={styles.pageSelect}
                                            value={String(page)}
                                            onChange={e => setPage(Number(e.target.value))}
                                            aria-label="Current page"
                                        >
                                            {Array.from({ length: totalPages }).map((_, idx) => (
                                                <option key={idx + 1} value={idx + 1}>
                                                    {idx + 1}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button key={p} className={styles.paginationButton} onClick={() => setPage(p)}>
                                            {p}
                                        </button>
                                    )
                                ))}
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className={styles.tableHeader}>
                    <div className={styles.expandHeader}></div>
                    <div className={styles.nameHeader} onClick={() => changeSort('name')}>Name</div>
                    <div className={styles.centerHeader} onClick={() => changeSort('email')}>Email</div>
                    <div className={styles.smallHeader}>Age</div>
                    <div className={styles.smallHeader}>Sex</div>
                    <div className={styles.smallHeader}>Courses</div>
                    <div className={styles.centerHeader} onClick={() => changeSort('attendance')}>Attendance</div>
                    <div className={styles.actionsHeader}>
                        Actions
                        <input
                            aria-label="Select all on page"
                            type="checkbox"
                            className={styles.checkbox}
                            checked={pageStudents.every(s => selectedIds[s.id]) && pageStudents.length > 0}
                            onChange={e => toggleSelectAllOnPage(e.target.checked)}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                </div>

                {visibleStudents.length === 0 ? (
                    <div className={styles.emptyState}>
                        No students match your filters.
                    </div>
                ) : (
                    pageStudents.map(student => {
                        const isExpanded = expandedStudentId === student.id;
                        const globalActive = StorageService.getStudentActiveStatus(student.id);

                        return (
                            <React.Fragment key={student.id}>
                                <div
                                    className={[
                                        styles.tableRow,
                                        isExpanded ? styles.tableRowExpanded : '',
                                        !globalActive ? styles.tableRowInactive : ''
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => toggleStudentExpand(student.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStudentExpand(student.id); } }}
                                >
                                    <div className={styles.expandCell} onClick={e => { e.stopPropagation(); toggleStudentExpand(student.id); }}>
                                        {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#94a3b8" />}
                                    </div>

                                    <div className={styles.nameCell}>
                                        <div className={styles.avatar}>{getInitials(student.name)}</div>
                                        <div>
                                            <div className={styles.nameText}>
                                                {formatStudentName(student.name)}
                                            </div>
                                            <div className={styles.cellMutedSmall}>{student.email}</div>
                                        </div>
                                    </div>

                                    <div className={styles.centerCell}>{student.email}</div>
                                    <div className={styles.smallCell}>{calculateAge(student.birthDate)}</div>
                                    <div className={styles.smallCell}>{student.sex || '-'}</div>
                                    <div className={styles.smallCell}>{enrollments.filter(e => e.studentId === student.id).length}</div>
                                    <div className={styles.attendanceCell}>
                                        {!globalActive ? (
                                            <span className={styles.unenrolledFlag} title="Not enrolled" aria-label="Not enrolled">
                                                <AlertTriangle size={14} />
                                                Not enrolled
                                            </span>
                                        ) : (() => {
                                            const overall = getStudentOverallAttendance(student.id);
                                            if (overall.total === 0) return <span className={styles.attendanceEmpty}>—</span>;
                                            const level = getAttendanceStatus(overall.percent);
                                            return (
                                                <div className={styles.attendanceRow}>
                                                    <progress
                                                        className={`${styles.attendanceProgress} ${styles[`attendanceProgress${level}`]}`}
                                                        value={overall.percent}
                                                        max={100}
                                                    />
                                                    <span className={`${styles.attendanceValue} ${styles[`attendanceValue${level}`]}`}>
                                                        {overall.percent}%
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className={styles.actionGroup}>
                                        {!globalActive && (
                                            <Button size="sm" variant="success" className={styles.statusToggleButton} onClick={(e) => { e.stopPropagation(); handleToggleGlobalStatus(student); }} aria-label="Mark student enrolled">
                                                Enroll
                                            </Button>
                                        )}
                                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenModal(student); }} aria-label="Edit student">
                                            <Pencil size={14} />
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeactivateFromTrash(student); }} aria-label="Mark student withdrawn" disabled={!globalActive}>
                                            <Trash2 size={14} />
                                        </Button>
                                        <input type="checkbox" className={styles.actionCheckbox} checked={!!selectedIds[student.id]} onChange={(e) => { e.stopPropagation(); toggleSelect(student.id, e.target.checked); }} aria-label={`Select ${student.name}`} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className={styles.expandedPanel}>
                                        <div className={styles.expandedGrid}>
                                            {/* Left: Course & Attendance History */}
                                            <div>
                                                <h3 className={styles.sectionTitle}>
                                                    <ClipboardList size={18} /> Course History
                                                </h3>
                                                {(() => {
                                                    const { activeSections, finishedSections, calcAttendance } = getStudentMetrics(student.id);

                                                    const SectionRow = ({ section, status }: { section: Section, status: string }) => {
                                                        const globalActive = StorageService.getStudentActiveStatus(student.id);
                                                        const sectionActive = StorageService.getSectionStudentActiveStatus(student.id, section.id);
                                                        const effectiveActive = globalActive && sectionActive;
                                                        const statusLabel = !globalActive
                                                            ? 'Withdrawn (Overall)'
                                                            : !sectionActive
                                                                ? 'Withdrawn'
                                                                : status;
                                                        const stats = calcAttendance(section.id);
                                                        const sectionStatus = getAttendanceStatus(stats.percent);
                                                        const statusClass = status === 'Enrolled' && effectiveActive ? styles.statusActive : styles.statusInactive;
                                                        return (
                                                            <div className={styles.sectionCard}>
                                                                <div className={styles.sectionCardHeader}>
                                                                    <div className={styles.sectionTitleGroup}>
                                                                        <div className={styles.sectionName}>{section.name}</div>
                                                                        <div className={`${styles.statusPill} ${statusClass}`} aria-label={`Status: ${statusLabel}`}>
                                                                            <span className={styles.statusDot} />
                                                                            <span className={styles.statusText}>{statusLabel}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles.sectionActions}>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={effectiveActive ? 'danger' : 'success'}
                                                                            className={styles.statusToggleButton}
                                                                            onClick={() => handleToggleSectionStatus(student, section)}
                                                                        >
                                                                            {effectiveActive ? 'Withdraw' : 'Enroll'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className={styles.sectionProgressRow}>
                                                                    <progress
                                                                        className={`${styles.attendanceProgress} ${styles[`attendanceProgress${sectionStatus}`]}`}
                                                                        value={stats.percent}
                                                                        max={100}
                                                                    />
                                                                    <span className={styles.sectionProgressValue}>{stats.percent}% Att.</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <>
                                                            {activeSections.length > 0 && activeSections.map(s => <SectionRow key={s.id} section={s} status="Enrolled" />)}
                                                            {finishedSections.length > 0 && finishedSections.map(s => <SectionRow key={s.id} section={s} status="Completed" />)}
                                                            {activeSections.length === 0 && finishedSections.length === 0 && (
                                                                <div className={styles.emptyCourses}>No courses enrolled</div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            {/* Right: Payment History */}
                                            <div>
                                                <h3 className={styles.sectionTitle}>
                                                    <DollarSign size={18} /> Payment History
                                                </h3>
                                                <PaymentsModule studentId={student.id} hideHeader={true} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}


            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingStudent ? 'Edit Student' : 'Add Student'}
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    <div className={styles.formGrid}>
                        <Input
                            label="Birth Date"
                            type="date"
                            value={formData.birthDate}
                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                        <Select
                            label="Sex"
                            value={formData.sex}
                            onChange={e => setFormData({ ...formData, sex: e.target.value as any })}
                            options={[
                                { value: '', label: 'Select Sex' },
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">{editingStudent ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
