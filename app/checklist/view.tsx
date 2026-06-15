import { Outlet } from 'react-router';
import { useSmallScreenStyle } from '../style';
import type { Route } from './+types/view';
import { ChecklistEventFilterBar } from './eventfilter';
import { ChecklistSourceList } from './sourcelist';
import { ChecklistTypeFilterBar } from './typefilter';

export default function ChecklistView({ params, matches }: Route.ComponentProps) {
    const smallScreen = useSmallScreenStyle();
    return (
        <div className="checklist-view">
            <ChecklistEventFilterBar />
            <ChecklistTypeFilterBar />
            {(!smallScreen || params.sid === undefined) && <ChecklistSourceList />}
            <Outlet />
        </div>
    );
}
