import { createHashRouter } from 'react-router-dom';
import { Layout } from './shared/components/Layout';
import { Dashboard, Dashboard2, Dashboard3 } from './features/dashboard';
import { Courses } from './features/courses';
import { Students, Professors } from './features/users';
import { Payments } from './features/payments';
import { Attendance } from './features/attendance';
import { Schedule } from './features/schedule';

export const router = createHashRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'dashboard-2', element: <Dashboard2 /> },
            { path: 'dashboard-3', element: <Dashboard3 /> },
            { path: 'schedule', element: <Schedule /> },
            { path: 'courses', element: <Courses /> },
            { path: 'attendance', element: <Attendance /> },
            { path: 'students', element: <Students /> },
            { path: 'professors', element: <Professors /> },
            { path: 'payments', element: <Payments /> },
        ]
    }
]);
