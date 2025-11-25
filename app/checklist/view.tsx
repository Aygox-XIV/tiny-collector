import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { ChecklistEventFilterBar } from './eventfilter';
import { ChecklistSourceList } from './sourcelist';
import { ChecklistTypeFilterBar } from './typefilter';

export default function ChecklistView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="checklist-view">
            <ChecklistEventFilterBar />
            <ChecklistTypeFilterBar />
            <ChecklistSourceList />
            <Outlet />
        </div>
    );
}
