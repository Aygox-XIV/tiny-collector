import { useState } from 'react';
import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { ChecklistEventFilterBar } from './eventfilter';
import { SourceFilterContext, type SourceFilter } from './filtercontext';
import { ChecklistSourceList } from './sourcelist';
import { ChecklistTypeFilterBar } from './typefilter';

export default function ChecklistView({ params, matches }: Route.ComponentProps) {
    const filterContext = useState<SourceFilter>({});
    return (
        <div className="checklist-view">
            <SourceFilterContext value={filterContext}>
                <ChecklistEventFilterBar />
                <ChecklistTypeFilterBar />
                <ChecklistSourceList />
                <Outlet />
            </SourceFilterContext>
        </div>
    );
}
