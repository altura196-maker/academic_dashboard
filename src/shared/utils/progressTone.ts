export type ProgressTier = 'success' | 'info' | 'warning' | 'danger' | 'near_critical' | 'critical';
export type ProgressVisualTone = 'success' | 'info' | 'warning' | 'danger';
export type ProgressSeverity = 'normal' | 'near_critical' | 'critical';

export type DashboardToneClassKey = 'toneSuccess' | 'toneInfo' | 'toneWarning' | 'toneDanger';
export type DashboardBadgeClassKey = 'badgeSuccess' | 'badgeInfo' | 'badgeWarning' | 'badgeDanger';
export type DashboardSeverityClassKey = 'severityNormal' | 'severityNearCritical' | 'severityCritical';

const clampPercent = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
};

export const getProgressTier = (percentage: number): ProgressTier => {
    const value = clampPercent(percentage);
    if (value >= 85) return 'success';
    if (value >= 65) return 'info';
    if (value >= 45) return 'warning';
    if (value >= 33) return 'danger';
    if (value >= 10) return 'near_critical';
    return 'critical';
};

export const getProgressVisualTone = (tier: ProgressTier): ProgressVisualTone => {
    if (tier === 'success') return 'success';
    if (tier === 'info') return 'info';
    if (tier === 'warning') return 'warning';
    return 'danger';
};

export const getProgressSeverity = (tier: ProgressTier): ProgressSeverity => {
    if (tier === 'near_critical') return 'near_critical';
    if (tier === 'critical') return 'critical';
    return 'normal';
};

export const getDashboardToneClassKey = (percentage: number): DashboardToneClassKey => {
    const tone = getProgressVisualTone(getProgressTier(percentage));
    if (tone === 'success') return 'toneSuccess';
    if (tone === 'info') return 'toneInfo';
    if (tone === 'warning') return 'toneWarning';
    return 'toneDanger';
};

export const getDashboardBadgeClassKey = (percentage: number): DashboardBadgeClassKey => {
    const tone = getProgressVisualTone(getProgressTier(percentage));
    if (tone === 'success') return 'badgeSuccess';
    if (tone === 'info') return 'badgeInfo';
    if (tone === 'warning') return 'badgeWarning';
    return 'badgeDanger';
};

export const getDashboardSeverityClassKey = (percentage: number): DashboardSeverityClassKey => {
    const severity = getProgressSeverity(getProgressTier(percentage));
    if (severity === 'near_critical') return 'severityNearCritical';
    if (severity === 'critical') return 'severityCritical';
    return 'severityNormal';
};

const getToneColorToken = (tone: ProgressVisualTone) => {
    if (tone === 'success') return 'var(--status-success)';
    if (tone === 'info') return 'var(--status-info)';
    if (tone === 'warning') return 'var(--status-warning)';
    return 'var(--status-danger)';
};

const getIntensity = (severity: ProgressSeverity) => {
    if (severity === 'near_critical') return { mix: 88, text: 94, factor: '1.14' };
    if (severity === 'critical') return { mix: 100, text: 100, factor: '1.32' };
    return { mix: 76, text: 88, factor: '1' };
};

export const getProgressCssVars = (percentage: number): Record<string, string> => {
    const tier = getProgressTier(percentage);
    const tone = getProgressVisualTone(tier);
    const severity = getProgressSeverity(tier);
    const toneColor = getToneColorToken(tone);
    const intensity = getIntensity(severity);

    return {
        '--progress-color': `color-mix(in srgb, ${toneColor} ${intensity.mix}%, #ffffff)`,
        '--progress-text-color': `color-mix(in srgb, ${toneColor} ${intensity.text}%, #0f172a)`,
        '--progress-intensity': intensity.factor
    };
};
