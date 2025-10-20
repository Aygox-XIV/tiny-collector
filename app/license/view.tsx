// include filter bar, list of required materials

import { Outlet } from 'react-router';
import type { Route } from './+types/view';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="license-view">
            <p>License materials view.</p>
            <Outlet />
        </div>
    );
}
