import React, { useState, useEffect, useMemo, useCallback, useRef, type CSSProperties } from 'react';
import { StorageService } from '../../shared/utils/storage';
import { Course, Student, Section, Attendance, Enrollment, StudentEnrollmentStatus } from '../../shared/utils/types';
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

interface SelectionBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface DragSelectionState {
    startX: number;
    startY: number;
    hasDragged: boolean;
    initialSelected: Record<string, boolean>;
}

import { PageHeader } from '../../shared/components/PageHeader';

export const StudentsModule = ({ sectionId, courseId, hideHeader = false }: StudentsModuleProps) => {
    const { showConfirmation } = useConfirmation();
    // Data
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollPromptOpen, setIsEnrollPromptOpen] = useState(false);
    const [enrollTargetStudent, setEnrollTargetStudent] = useState<Student | null>(null);
    const [enrollSelectionByCourse, setEnrollSelectionByCourse] = useState<Record<string, string>>({});
    const [enrollPromptError, setEnrollPromptError] = useState('');

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
    const [filterActive, setFilterActive] = useState<'all' | StudentEnrollmentStatus>('all');

    const [sortBy, setSortBy] = useState<'name' | 'email' | 'attendance' | ''>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(25);
    const [pageSizeInput, setPageSizeInput] = useState<string>(String(25));
    const [isRowsMenuOpen, setIsRowsMenuOpen] = useState(false);
    const rowsPresetOptions = [5, 10, 15, 20, 25, 50, 100, 150];

    useEffect(() => {
        setPage(1);
        setSelectedIds({});
    }, [pageSize]);

    useEffect(() => {
        // keep input in sync when pageSize is changed programmatically
        setPageSizeInput(String(pageSize));
    }, [pageSize]);

    const commitPageSizeInput = useCallback((rawValue: string) => {
        const value = rawValue.trim();
        if (!/^\d+$/.test(value)) {
            setPageSize(10);
            setPageSizeInput('10');
            return;
        }
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) {
            setPageSize(10);
            setPageSizeInput('10');
            return;
        }
        setPageSize(n);
        setPageSizeInput(String(n));
    }, []);

    const handlePageSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/[^\d]/g, '');
        setPageSizeInput(v);
        setIsRowsMenuOpen(true);
        if (v) {
            const n = Number(v);
            if (n > 0) {
                setPageSize(n);
            }
        }
    };

    const handlePageSizeBlur = () => {
        setIsRowsMenuOpen(false);
        commitPageSizeInput(pageSizeInput);
    };

    const handleRowsOptionSelect = (value: number) => {
        setPageSize(value);
        setPageSizeInput(String(value));
        setIsRowsMenuOpen(false);
    };

    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

    const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const rowsControlRef = useRef<HTMLDivElement | null>(null);
    const selectedIdsRef = useRef<Record<string, boolean>>({});
    const dragSelectionRef = useRef<DragSelectionState | null>(null);
    const suppressRowClickUntilRef = useRef(0);

    useEffect(() => {
        selectedIdsRef.current = selectedIds;
    }, [selectedIds]);

    useEffect(() => {
        const handleOutsideRowsMenuClick = (event: MouseEvent) => {
            if (!rowsControlRef.current) return;
            if (rowsControlRef.current.contains(event.target as Node)) return;
            setIsRowsMenuOpen(false);
            commitPageSizeInput(pageSizeInput);
        };

        window.addEventListener('mousedown', handleOutsideRowsMenuClick);
        return () => window.removeEventListener('mousedown', handleOutsideRowsMenuClick);
    }, [pageSizeInput, commitPageSizeInput]);

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
        setSections(StorageService.getActiveSections());
        setCourses(StorageService.getCourses());
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

    const syncGlobalStatusFromSections = (studentId: string) => {
        const activeSections = StorageService.getActiveSections();
        const activeSectionIds = new Set(activeSections.map(section => section.id));
        const ongoingEnrollments = StorageService.getEnrollments()
            .filter(e => e.studentId === studentId && activeSectionIds.has(e.sectionId));
        if (ongoingEnrollments.length === 0) return;

        const hasActiveSection = ongoingEnrollments.some(e =>
            StorageService.getSectionStudentActiveStatus(studentId, e.sectionId)
        );
        const globalActive = StorageService.getStudentActiveStatus(studentId);
        if (!hasActiveSection && globalActive) {
            StorageService.addStudentStatusHistory({
                id: crypto.randomUUID(),
                studentId,
                isActive: false,
                changedAt: new Date().toISOString()
            });
        } else if (hasActiveSection && !globalActive) {
            StorageService.addStudentStatusHistory({
                id: crypto.randomUUID(),
                studentId,
                isActive: true,
                changedAt: new Date().toISOString()
            });
        }
    };

    const handleOpenEnrollPrompt = (student: Student) => {
        const activeSections = StorageService.getActiveSections();
        const activeSectionIds = new Set(activeSections.map(section => section.id));
        const enrollmentsForStudent = StorageService.getEnrollments().filter(e => e.studentId === student.id);
        const initialSelection: Record<string, string> = {};

        enrollmentsForStudent.forEach(enrollment => {
            if (!activeSectionIds.has(enrollment.sectionId)) return;
            if (!StorageService.getSectionStudentActiveStatus(student.id, enrollment.sectionId)) return;
            initialSelection[enrollment.courseId] = enrollment.sectionId;
        });

        setEnrollTargetStudent(student);
        setEnrollSelectionByCourse(initialSelection);
        setEnrollPromptError('');
        setIsEnrollPromptOpen(true);
    };

    const handleCloseEnrollPrompt = () => {
        setIsEnrollPromptOpen(false);
        setEnrollTargetStudent(null);
        setEnrollSelectionByCourse({});
        setEnrollPromptError('');
    };

    const toggleEnrollSelection = (courseId: string, sectionId: string) => {
        setEnrollSelectionByCourse(prev => {
            if (prev[courseId] === sectionId) {
                const next = { ...prev };
                delete next[courseId];
                return next;
            }
            return { ...prev, [courseId]: sectionId };
        });
        if (enrollPromptError) setEnrollPromptError('');
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
            title: 'Withdraw Student?',
            message: `Withdraw "${student.name}" from all active courses and mark them withdrawn globally?`,
            confirmLabel: 'Withdraw student',
            confirmVariant: 'danger',
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
        if (!isActive) {
            handleOpenEnrollPrompt(student);
            return;
        }
        const confirmed = await showConfirmation({
            title: 'Withdraw Student?',
            message: `Withdraw "${student.name}" from all active courses and mark them withdrawn globally?`,
            confirmLabel: 'Withdraw student',
            confirmVariant: 'danger',
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

    const handleToggleSectionStatus = async (student: Student, section: Section) => {
        const globalActive = StorageService.getStudentActiveStatus(student.id);
        const sectionActive = StorageService.getSectionStudentActiveStatus(student.id, section.id);
        const effectiveActive = globalActive && sectionActive;
        const nextEffectiveActive = !effectiveActive;
        const activeSections = StorageService.getActiveSections();
        const activeSectionIds = new Set(activeSections.map(s => s.id));
        const ongoingEnrollments = StorageService.getEnrollments()
            .filter(e => e.studentId === student.id && activeSectionIds.has(e.sectionId));
        const activeOngoingCount = ongoingEnrollments.filter(e =>
            StorageService.getSectionStudentActiveStatus(student.id, e.sectionId)
        ).length;
        const isLastActiveSection = effectiveActive && activeOngoingCount <= 1;

        const confirmed = await showConfirmation({
            title: nextEffectiveActive ? 'Enroll Student in Section?' : 'Withdraw Student from Section?',
            message: nextEffectiveActive
                ? `Enroll "${student.name}" in "${section.name}"?`
                : `Withdraw "${student.name}" from "${section.name}"?${isLastActiveSection ? ' This will mark the student as withdrawn globally.' : ''}`,
            confirmLabel: nextEffectiveActive ? 'Enroll in section' : 'Withdraw from section',
            confirmVariant: nextEffectiveActive ? 'success' : 'danger',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;

        const changedAt = new Date().toISOString();
        if (nextEffectiveActive) {
            if (!globalActive) {
                StorageService.addStudentStatusHistory({
                    id: crypto.randomUUID(),
                    studentId: student.id,
                    isActive: true,
                    changedAt
                });
            }
            if (!sectionActive) {
                StorageService.addSectionStudentStatusHistory({
                    id: crypto.randomUUID(),
                    studentId: student.id,
                    sectionId: section.id,
                    isActive: true,
                    changedAt
                });
            }
        } else if (sectionActive) {
            StorageService.addSectionStudentStatusHistory({
                id: crypto.randomUUID(),
                studentId: student.id,
                sectionId: section.id,
                isActive: false,
                changedAt
            });
        }

        syncGlobalStatusFromSections(student.id);
        loadData();
    };

    const handleEnrollSubmit = () => {
        if (!enrollTargetStudent) return;
        const selections = Object.entries(enrollSelectionByCourse)
            .filter(([, sectionId]) => sectionId);
        if (selections.length === 0) {
            setEnrollPromptError('Select at least one section to enroll.');
            return;
        }

        const studentId = enrollTargetStudent.id;
        const now = new Date().toISOString();
        const enrollmentsForStudent = StorageService.getEnrollments().filter(e => e.studentId === studentId);
        const activeSectionIds = new Set(StorageService.getActiveSections().map(section => section.id));
        try {
            selections.forEach(([courseId, sectionId]) => {
                const existingEnrollment = enrollmentsForStudent.find(e => e.courseId === courseId);
                if (existingEnrollment && existingEnrollment.sectionId !== sectionId) {
                    if (activeSectionIds.has(existingEnrollment.sectionId)) {
                        StorageService.unenrollStudent(existingEnrollment.sectionId, studentId);
                    }
                    StorageService.enrollStudent({
                        id: crypto.randomUUID(),
                        studentId,
                        sectionId,
                        courseId,
                        enrolledAt: now
                    });
                    return;
                }

                if (existingEnrollment && existingEnrollment.sectionId === sectionId) {
                    if (!StorageService.getStudentActiveStatus(studentId)) {
                        StorageService.addStudentStatusHistory({
                            id: crypto.randomUUID(),
                            studentId,
                            isActive: true,
                            changedAt: now
                        });
                    }
                    if (!StorageService.getSectionStudentActiveStatus(studentId, sectionId)) {
                        StorageService.addSectionStudentStatusHistory({
                            id: crypto.randomUUID(),
                            studentId,
                            sectionId,
                            isActive: true,
                            changedAt: now
                        });
                    }
                    return;
                }

                StorageService.enrollStudent({
                    id: crypto.randomUUID(),
                    studentId,
                    sectionId,
                    courseId,
                    enrolledAt: now
                });
            });

            syncGlobalStatusFromSections(studentId);
            loadData();
            handleCloseEnrollPrompt();
        } catch (err: any) {
            setEnrollPromptError(err?.message || 'Unable to enroll student in selected sections.');
        }
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
        let enrolledCount = 0;
        let withdrawnCount = 0;
        let notEnrolledCount = 0;
        const enrolledIds: string[] = [];

        students.forEach(student => {
            const status = StorageService.getStudentEnrollmentStatus(student.id);
            if (status === 'enrolled') {
                enrolledCount++;
                enrolledIds.push(student.id);
            } else if (status === 'withdrawn') {
                withdrawnCount++;
            } else {
                notEnrolledCount++;
            }
        });

        const avgCourses = students.length > 0 ? Math.floor(enrollments.length / students.length) : 0;
        const attendanceSamples = enrolledIds.map(id => getStudentOverallAttendance(id).percent).filter(p => p > 0);
        const avgAttendance = attendanceSamples.length > 0
            ? Math.round(attendanceSamples.reduce((a, b) => a + b, 0) / attendanceSamples.length)
            : 0;

        return {
            totalStudents: students.length,
            enrolledCount,
            withdrawnCount,
            notEnrolledCount,
            avgCourses,
            avgAttendance
        };
    }, [students, enrollments, getStudentOverallAttendance]);

    const activeSectionIds = useMemo(() => new Set(sections.map(section => section.id)), [sections]);

    const activeSectionsByCourse = useMemo(() => {
        const byCourse = new Map<string, Section[]>();
        sections.forEach(section => {
            if (!byCourse.has(section.courseId)) {
                byCourse.set(section.courseId, []);
            }
            byCourse.get(section.courseId)?.push(section);
        });

        return courses
            .filter(course => byCourse.has(course.id))
            .map(course => ({
                course,
                sections: (byCourse.get(course.id) || []).slice().sort((a, b) => a.name.localeCompare(b.name))
            }));
    }, [sections, courses]);

    const enrollSelectionCount = Object.keys(enrollSelectionByCourse).length;

    const selectedEnrollCourseTags = useMemo(() => {
        return activeSectionsByCourse
            .map(({ course, sections }) => {
                const sectionId = enrollSelectionByCourse[course.id];
                if (!sectionId) return null;
                const selectedSection = sections.find(section => section.id === sectionId);
                if (!selectedSection) return null;
                return {
                    key: course.id,
                    courseName: course.name,
                    sectionName: selectedSection.name
                };
            })
            .filter((tag): tag is { key: string; courseName: string; sectionName: string } => Boolean(tag));
    }, [activeSectionsByCourse, enrollSelectionByCourse]);

    const getStudentMetrics = (studentId: string) => {
        const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
        const studentSections = sections.filter(s => studentEnrollments.some(e => e.sectionId === s.id));

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const activeSections = studentSections.filter(s => !s.endDate || s.endDate >= today);

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

        return { activeSections, calcAttendance };
    };

    const toggleStudentExpand = (studentId: string) => {
        setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    // UI helpers
    const visibleStudents = useMemo(() => {
        let out = [...students];

        if (filterActive !== 'all') {
            out = out.filter(s => StorageService.getStudentEnrollmentStatus(s.id) === filterActive);
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

    const setRowRef = useCallback((studentId: string, node: HTMLDivElement | null) => {
        if (node) {
            rowRefs.current[studentId] = node;
            return;
        }
        delete rowRefs.current[studentId];
    }, []);

    const isInteractiveElement = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return false;
        return Boolean(target.closest('button, input, select, textarea, a, label, .modal-backdrop, .modal-panel'));
    };

    const isSameSelection = (a: Record<string, boolean>, b: Record<string, boolean>) => {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const key of keys) {
            if (!!a[key] !== !!b[key]) return false;
        }
        return true;
    };

    const normalizeSelectionBox = (startX: number, startY: number, endX: number, endY: number): SelectionBox => ({
        left: Math.min(startX, endX),
        top: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY)
    });

    const boxIntersectsRect = (box: SelectionBox, rect: DOMRect) => {
        const boxRight = box.left + box.width;
        const boxBottom = box.top + box.height;
        return box.left <= rect.right && boxRight >= rect.left && box.top <= rect.bottom && boxBottom >= rect.top;
    };

    const shouldSuppressRowClick = () => performance.now() < suppressRowClickUntilRef.current;

    const handleRowExpand = (studentId: string) => {
        if (shouldSuppressRowClick()) return;
        toggleStudentExpand(studentId);
    };

    useEffect(() => {
        let activeMouseMove: ((event: MouseEvent) => void) | null = null;
        let activeMouseUp: ((event: MouseEvent) => void) | null = null;

        const detachDragListeners = () => {
            if (activeMouseMove) {
                window.removeEventListener('mousemove', activeMouseMove, true);
                activeMouseMove = null;
            }
            if (activeMouseUp) {
                window.removeEventListener('mouseup', activeMouseUp, true);
                activeMouseUp = null;
            }
        };

        const finishDragSelection = (didDrag: boolean) => {
            detachDragListeners();
            dragSelectionRef.current = null;
            document.body.classList.remove('students-drag-selecting');
            setSelectionBox(null);
            if (didDrag) {
                suppressRowClickUntilRef.current = performance.now() + 160;
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            if (event.button !== 0 || isModalOpen || isEnrollPromptOpen || isInteractiveElement(event.target)) return;

            dragSelectionRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                hasDragged: false,
                initialSelected: { ...selectedIdsRef.current }
            };

            activeMouseMove = (moveEvent: MouseEvent) => {
                const dragState = dragSelectionRef.current;
                if (!dragState) return;

                const deltaX = moveEvent.clientX - dragState.startX;
                const deltaY = moveEvent.clientY - dragState.startY;

                if (!dragState.hasDragged && Math.hypot(deltaX, deltaY) < 4) return;

                if (!dragState.hasDragged) {
                    dragState.hasDragged = true;
                    document.body.classList.add('students-drag-selecting');
                }

                moveEvent.preventDefault();

                const box = normalizeSelectionBox(dragState.startX, dragState.startY, moveEvent.clientX, moveEvent.clientY);
                setSelectionBox(box);

                const nextSelection = { ...dragState.initialSelected };
                Object.entries(rowRefs.current).forEach(([studentId, node]) => {
                    if (!node) return;
                    if (boxIntersectsRect(box, node.getBoundingClientRect())) {
                        nextSelection[studentId] = true;
                    }
                });

                setSelectedIds(prev => (isSameSelection(prev, nextSelection) ? prev : nextSelection));
            };

            activeMouseUp = () => {
                finishDragSelection(!!dragSelectionRef.current?.hasDragged);
            };

            window.addEventListener('mousemove', activeMouseMove, true);
            window.addEventListener('mouseup', activeMouseUp, true);
        };

        window.addEventListener('mousedown', handleMouseDown, true);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown, true);
            finishDragSelection(!!dragSelectionRef.current?.hasDragged);
        };
    }, [isModalOpen, isEnrollPromptOpen]);

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
            title: active ? 'Enroll Selected Students?' : 'Withdraw Selected Students?',
            message: active
                ? `Enroll ${selectedCount} selected students?`
                : `Withdraw ${selectedCount} selected students from all active courses?`,
            confirmLabel: active ? 'Enroll selected' : 'Withdraw selected',
            confirmVariant: active ? 'success' : 'danger',
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

    const getStudentShare = (count: number) => {
        const total = studentInsights.totalStudents;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return { count, percentage };
    };

    const enrolledShare = getStudentShare(studentInsights.enrolledCount);
    const notEnrolledShare = getStudentShare(studentInsights.notEnrolledCount);
    const withdrawnShare = getStudentShare(studentInsights.withdrawnCount);
    const avgAttendanceLevel = getAttendanceStatus(studentInsights.avgAttendance);
    const avgAttendanceBadgeClass = avgAttendanceLevel === 'high'
        ? styles.insightPercentEnrolled
        : avgAttendanceLevel === 'mid'
            ? styles.insightPercentWarning
            : styles.insightPercentDanger;
    const getInsightFillStyle = (percentage: number): CSSProperties => ({
        '--insight-fill': `${Math.max(0, Math.min(100, percentage))}%`
    } as CSSProperties);

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
                <div className={styles.insightCard} data-tone="primary" style={getInsightFillStyle(0)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="primary">
                                <Users size={18} />
                            </div>
                            <div className={styles.insightLabel}>Total Students</div>
                        </div>
                        <div className={styles.insightValue}>{studentInsights.totalStudents}</div>
                    </div>
                </div>
                <div className={styles.insightCard} data-tone="success" style={getInsightFillStyle(enrolledShare.percentage)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="success">
                                <UserCheck size={18} />
                            </div>
                            <div className={styles.insightLabel}>Enrolled</div>
                        </div>
                        <div className={styles.insightValueSplit}>
                            <span className={styles.insightValueCount}>{enrolledShare.count}</span>
                            <span className={`${styles.insightPercentBadge} ${styles.insightPercentEnrolled}`}>
                                <span className={styles.insightPercentBadgeText}>{enrolledShare.percentage}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.insightCard} data-tone="info" style={getInsightFillStyle(notEnrolledShare.percentage)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="info">
                                <UserX size={18} />
                            </div>
                            <div className={styles.insightLabel}>Not enrolled</div>
                        </div>
                        <div className={styles.insightValueSplit}>
                            <span className={styles.insightValueCount}>{notEnrolledShare.count}</span>
                            <span className={`${styles.insightPercentBadge} ${styles.insightPercentInfo}`}>
                                <span className={styles.insightPercentBadgeText}>{notEnrolledShare.percentage}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.insightCard} data-tone="warning" style={getInsightFillStyle(withdrawnShare.percentage)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="warning">
                                <AlertTriangle size={18} />
                            </div>
                            <div className={styles.insightLabel}>Withdrawn</div>
                        </div>
                        <div className={styles.insightValueSplit}>
                            <span className={styles.insightValueCount}>{withdrawnShare.count}</span>
                            <span className={`${styles.insightPercentBadge} ${styles.insightPercentWarning}`}>
                                <span className={styles.insightPercentBadgeText}>{withdrawnShare.percentage}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.insightCard} data-tone="info" style={getInsightFillStyle(studentInsights.avgAttendance)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="info">
                                <BarChart3 size={18} />
                            </div>
                            <div className={styles.insightLabel}>Avg Attendance</div>
                        </div>
                        <div className={styles.insightValueSplit}>
                            <span className={`${styles.insightPercentBadge} ${avgAttendanceBadgeClass}`}>
                                <span className={styles.insightPercentBadgeText}>{studentInsights.avgAttendance}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.insightCard} data-tone="accent" style={getInsightFillStyle(0)}>
                    <div className={styles.insightBody}>
                        <div className={styles.insightLabelRow}>
                            <div className={styles.insightIcon} data-tone="accent">
                                <BookOpen size={18} />
                            </div>
                            <div className={styles.insightLabel}>Courses / Student</div>
                        </div>
                        <div className={styles.insightValueSplit}>
                            <span className={`${styles.insightPercentBadge} ${styles.insightPercentAccent}`}>
                                <span className={styles.insightPercentBadgeText}>{studentInsights.avgCourses}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.chipGroup} role="group" aria-label="Filter by enrollment status">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'enrolled', label: 'Enrolled' },
                        { key: 'not_enrolled', label: 'Not enrolled' },
                        { key: 'withdrawn', label: 'Withdrawn' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            type="button"
                            className={`${styles.filterChip} ${filterActive === opt.key ? styles.filterChipActive : ''}`}
                            onClick={() => setFilterActive(opt.key as 'all' | StudentEnrollmentStatus)}
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
                        {selectedCount > 0 && (
                            <div className={styles.selectionBadgeWrap}>
                                <div className={styles.selectedBadge}>
                                    <div className={[styles.selectedDot, styles.selectedDotActive].join(' ')} />
                                    <span className={[styles.selectedText, styles.selectedTextActive].join(' ')}>
                                        {selectedCount} Selected
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.topBarRight}>
                        <div className={styles.pagination}>
                            <div className={styles.rowsControl} ref={rowsControlRef}>
                                <label htmlFor="rows-per-page" className={styles.rowsLabel}>Rows:</label>
                                <div className={styles.rowsPicker}>
                                    <input
                                        id="rows-per-page"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={pageSizeInput}
                                        onChange={handlePageSizeInputChange}
                                        onFocus={() => setIsRowsMenuOpen(true)}
                                        onClick={() => setIsRowsMenuOpen(true)}
                                        onBlur={handlePageSizeBlur}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setIsRowsMenuOpen(false);
                                            }
                                        }}
                                        className={styles.rowsInput}
                                        aria-label="Rows per page"
                                        aria-expanded={isRowsMenuOpen}
                                        aria-controls="rows-options-list"
                                        aria-haspopup="listbox"
                                    />
                                    <button
                                        type="button"
                                        className={styles.rowsPickerButton}
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => setIsRowsMenuOpen(open => !open)}
                                        aria-label="Toggle rows options"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                    {isRowsMenuOpen && (
                                        <div id="rows-options-list" className={styles.rowsOptions} role="listbox" aria-label="Rows options">
                                            {rowsPresetOptions.map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={[
                                                        styles.rowsOption,
                                                        pageSize === option ? styles.rowsOptionActive : ''
                                                    ].filter(Boolean).join(' ')}
                                                    onMouseDown={e => e.preventDefault()}
                                                    onClick={() => handleRowsOptionSelect(option)}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                        const studentStatus = StorageService.getStudentEnrollmentStatus(student.id);
                        const statusLabel = studentStatus === 'withdrawn' ? 'Withdrawn' : 'Not enrolled';

                        return (
                            <React.Fragment key={student.id}>
                                <div
                                    ref={node => setRowRef(student.id, node)}
                                    data-student-id={student.id}
                                    className={[
                                        styles.tableRow,
                                        selectedIds[student.id] ? styles.tableRowSelected : '',
                                        isExpanded ? styles.tableRowExpanded : '',
                                        !globalActive ? styles.tableRowInactive : ''
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => handleRowExpand(student.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStudentExpand(student.id); } }}
                                >
                                    <div className={styles.expandCell} onClick={e => { e.stopPropagation(); handleRowExpand(student.id); }}>
                                        {isExpanded ? <ChevronDown size={20} color="var(--text-secondary)" /> : <ChevronRight size={20} color="var(--table-head-color)" />}
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
                                    <div className={styles.smallCell}>
                                        {enrollments.filter(e => e.studentId === student.id && activeSectionIds.has(e.sectionId)).length}
                                    </div>
                                    <div className={styles.attendanceCell}>
                                        {studentStatus !== 'enrolled' ? (() => {
                                            const statusClass = studentStatus === 'withdrawn'
                                                ? styles.unenrolledFlagWithdrawn
                                                : styles.unenrolledFlagNotEnrolled;
                                            const StatusIcon = studentStatus === 'withdrawn' ? AlertTriangle : UserX;
                                            return (
                                                <span
                                                    className={`${styles.unenrolledFlag} ${statusClass}`}
                                                    title={statusLabel}
                                                    aria-label={statusLabel}
                                                >
                                                    <StatusIcon size={14} />
                                                    {statusLabel}
                                                </span>
                                            );
                                        })() : (() => {
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
                                        {studentStatus !== 'enrolled' && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                className={styles.statusToggleButton}
                                                onClick={(e) => { e.stopPropagation(); handleOpenEnrollPrompt(student); }}
                                                aria-label="Enroll student"
                                            >
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
                                                    const { activeSections, calcAttendance } = getStudentMetrics(student.id);

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
                                                            {activeSections.length === 0 && (
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

            {selectionBox && (
                <div
                    className={styles.dragSelectionBox}
                    style={{
                        left: selectionBox.left,
                        top: selectionBox.top,
                        width: selectionBox.width,
                        height: selectionBox.height
                    }}
                    aria-hidden
                />
            )}

            <Modal
                isOpen={isEnrollPromptOpen}
                onClose={handleCloseEnrollPrompt}
                title={enrollTargetStudent ? `Enroll ${enrollTargetStudent.name}` : 'Enroll Student'}
                panelClassName={styles.enrollPromptPanel}
            >
                <div className={styles.enrollPromptBody}>
                    <div className={styles.enrollSelectionSticky}>
                        <span className={styles.enrollSelectionLabel}>Selected</span>
                        {selectedEnrollCourseTags.length === 0 ? (
                            <span className={styles.enrollSelectionEmpty}>No courses selected</span>
                        ) : (
                            <div className={styles.enrollSelectionTags}>
                                {selectedEnrollCourseTags.map(tag => (
                                    <span key={tag.key} className={styles.enrollSelectionTag}>
                                        {tag.courseName} · {tag.sectionName}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className={styles.enrollPromptHint}>
                        Select the sections to enroll. One section per course.
                    </p>
                    {enrollPromptError && (
                        <div className={styles.enrollPromptError}>{enrollPromptError}</div>
                    )}
                    {activeSectionsByCourse.length === 0 ? (
                        <div className={styles.enrollPromptEmpty}>
                            No active sections available to enroll.
                        </div>
                    ) : (
                        <div className={styles.enrollCourseList}>
                            {activeSectionsByCourse.map(({ course, sections }) => (
                                <div key={course.id} className={styles.enrollCourseGroup}>
                                    <div className={styles.enrollCourseHeader}>
                                        <span className={styles.enrollCourseName}>{course.name}</span>
                                        <span className={styles.enrollCourseMeta}>
                                            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                                        </span>
                                    </div>
                                    <div className={styles.enrollSectionOptions}>
                                        {sections.map(section => {
                                            const isSelected = enrollSelectionByCourse[course.id] === section.id;
                                            return (
                                                <button
                                                    key={section.id}
                                                    type="button"
                                                    className={`${styles.enrollSectionOption} ${isSelected ? styles.enrollSectionOptionActive : ''}`}
                                                    onClick={() => toggleEnrollSelection(course.id, section.id)}
                                                    aria-pressed={isSelected}
                                                >
                                                    <div className={styles.enrollSectionName}>{section.name}</div>
                                                    <div className={styles.enrollSectionMeta}>
                                                        {(section.days && section.days.length > 0) ? section.days.join(', ') : 'Days TBD'}
                                                        {section.startTime && section.endTime
                                                            ? ` · ${section.startTime}-${section.endTime}`
                                                            : ''}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeSectionsByCourse.length > 0 && (
                        <div className={styles.enrollPromptSummary}>
                            {enrollSelectionCount} {enrollSelectionCount === 1 ? 'section' : 'sections'} selected
                        </div>
                    )}
                </div>
                <div className={styles.enrollPromptActions}>
                    <Button type="button" variant="secondary" onClick={handleCloseEnrollPrompt}>Cancel</Button>
                    <Button
                        type="button"
                        variant="success"
                        onClick={handleEnrollSubmit}
                        disabled={activeSectionsByCourse.length === 0}
                    >
                        Enroll
                    </Button>
                </div>
            </Modal>

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
