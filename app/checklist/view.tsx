import { Outlet } from 'react-router';
import type { Route } from './+types/view';

export default function ChecklistView({ params, matches }: Route.ComponentProps) {
    // TODO: per-source checklist UI
    return (
        <div className="checklist-view">
            <p>checklist view. list sources (journeys, etc) and collectable items obtainable from them</p>
            <Outlet />
        </div>
    );
}
