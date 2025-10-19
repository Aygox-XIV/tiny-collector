// include filter bar, catalog. include outlet for item view

import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { Catalog } from './catalog';
import { CatalogFilterBar } from './filterbar';
import { CatalogFilterContext } from './filtercontext';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="catalog-view">
            <CatalogFilterContext value={{}}>
                <CatalogFilterBar />
                <Catalog />
                <Outlet />
            </CatalogFilterContext>
        </div>
    );
}
