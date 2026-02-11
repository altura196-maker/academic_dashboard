import { useCallback } from 'react';
import { useConfirmation } from '../../shared/hooks/useConfirmation';
import { clearData, seedDatabase } from '../../shared/utils/seeder';

export const useDashboardActions = (reloadData: () => void) => {
    const { showConfirmation } = useConfirmation();

    const handleClearData = useCallback(async () => {
        const confirmed = await showConfirmation({
            title: 'Clear All Data?',
            message: 'This will remove all stored data. Are you sure you want to continue?',
            confirmLabel: 'Clear data',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;
        clearData();
        reloadData();
    }, [reloadData, showConfirmation]);

    const handleLoadDemoData = useCallback(async () => {
        const confirmed = await showConfirmation({
            title: 'Load Demo Data?',
            message: 'This will add demo data to existing data. Do you want to continue?',
            confirmLabel: 'Load demo data',
            cancelLabel: 'Cancel'
        });
        if (!confirmed) return;

        try {
            seedDatabase();
            reloadData();
            setTimeout(() => window.location.reload(), 500);
        } catch (error: any) {
            await showConfirmation({
                title: 'Error Loading Demo Data',
                message: `Error loading demo data: ${error.message}`,
                confirmLabel: 'OK',
                cancelLabel: 'Close'
            });
            console.error(error);
        }
    }, [reloadData, showConfirmation]);

    return {
        handleClearData,
        handleLoadDemoData
    };
};
