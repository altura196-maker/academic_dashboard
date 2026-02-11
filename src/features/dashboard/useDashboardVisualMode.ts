import { useCallback, useEffect, useState } from 'react';

export type DashboardVisualMode = 'balanced' | 'minimal' | 'expressive';

const STORAGE_KEY = 'dashboard_visual_mode';

const isVisualMode = (value: string | null): value is DashboardVisualMode => (
    value === 'balanced' || value === 'minimal' || value === 'expressive'
);

const getInitialMode = (): DashboardVisualMode => {
    if (typeof window === 'undefined') return 'balanced';
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    return isVisualMode(savedMode) ? savedMode : 'balanced';
};

export const useDashboardVisualMode = () => {
    const [mode, setMode] = useState<DashboardVisualMode>(getInitialMode);

    const setAndPersistMode = useCallback((nextMode: DashboardVisualMode) => {
        setMode(nextMode);
        window.localStorage.setItem(STORAGE_KEY, nextMode);
    }, []);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            if (!isVisualMode(event.newValue)) return;
            setMode(event.newValue);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return { mode, setMode: setAndPersistMode };
};
