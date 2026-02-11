import { useCallback, useEffect, useState } from 'react';
import { DashboardViewMode } from './types';

const STORAGE_KEY = 'dashboard_view';

const isViewMode = (value: string | null): value is DashboardViewMode => (
    value === 'executive' || value === 'matrix' || value === 'split'
);

const getInitialView = (): DashboardViewMode => {
    if (typeof window === 'undefined') return 'executive';
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    return isViewMode(savedMode) ? savedMode : 'executive';
};

export const useDashboardView = () => {
    const [view, setView] = useState<DashboardViewMode>(getInitialView);

    const setAndPersistView = useCallback((nextView: DashboardViewMode) => {
        setView(nextView);
        window.localStorage.setItem(STORAGE_KEY, nextView);
    }, []);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            if (!isViewMode(event.newValue)) return;
            setView(event.newValue);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return { view, setView: setAndPersistView };
};
