import { useEffect, useRef, useState } from 'react';
import { Database, MoreVertical, Trash } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { DashboardVisualMode } from '../useDashboardVisualMode';
import { DashboardViewMode } from '../types';
import styles from './DashboardHeaderControls.module.css';

interface DashboardHeaderControlsProps {
    mode: DashboardVisualMode;
    onModeChange: (mode: DashboardVisualMode) => void;
    view: DashboardViewMode;
    onViewChange: (view: DashboardViewMode) => void;
    onLoadDemoData: () => Promise<void> | void;
    onClearData: () => Promise<void> | void;
}

const MODE_OPTIONS: Array<{ value: DashboardVisualMode; label: string }> = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'expressive', label: 'Expressive' }
];

const VIEW_OPTIONS: Array<{ value: DashboardViewMode; label: string }> = [
    { value: 'executive', label: 'Executive Grid' },
    { value: 'matrix', label: 'Card Matrix' },
    { value: 'split', label: 'Split Panels' }
];

export const DashboardHeaderControls = ({
    mode,
    onModeChange,
    view,
    onViewChange,
    onLoadDemoData,
    onClearData
}: DashboardHeaderControlsProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handleDocumentClick = (event: MouseEvent) => {
            if (!menuRef.current) return;
            if (menuRef.current.contains(event.target as Node)) return;
            setMenuOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        window.addEventListener('mousedown', handleDocumentClick);
        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('mousedown', handleDocumentClick);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [menuOpen]);

    const handleAction = async (action: () => Promise<void> | void) => {
        setMenuOpen(false);
        await action();
    };

    return (
        <div className={styles.controlsWrap}>
            <div className={styles.visualModeWrap}>
                <span className={styles.visualModeLabel}>Switch view</span>
                <div className={styles.visualModeGroup} role="group" aria-label="Dashboard view mode">
                    {VIEW_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onViewChange(option.value)}
                            className={[
                                styles.visualModeButton,
                                view === option.value ? styles.visualModeButtonActive : ''
                            ].filter(Boolean).join(' ')}
                            aria-pressed={view === option.value}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.visualModeWrap}>
                <span className={styles.visualModeLabel}>Visual mode</span>
                <div className={styles.visualModeGroup} role="group" aria-label="Dashboard visual mode">
                    {MODE_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onModeChange(option.value)}
                            className={[
                                styles.visualModeButton,
                                mode === option.value ? styles.visualModeButtonActive : ''
                            ].filter(Boolean).join(' ')}
                            aria-pressed={mode === option.value}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.actionMenuWrap} ref={menuRef}>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={styles.menuButton}
                    onClick={() => setMenuOpen(open => !open)}
                    aria-label="Open dashboard actions"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                >
                    <MoreVertical size={16} />
                </Button>

                {menuOpen && (
                    <div className={styles.menuPanel} role="menu" aria-label="Dashboard actions">
                        <button
                            type="button"
                            role="menuitem"
                            className={styles.menuItem}
                            onClick={() => handleAction(onLoadDemoData)}
                        >
                            <Database size={15} />
                            <span>Load Demo Data</span>
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            onClick={() => handleAction(onClearData)}
                        >
                            <Trash size={15} />
                            <span>Clear Data</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
