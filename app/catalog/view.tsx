import { useState } from 'react';
import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { Catalog } from './catalog';
import { CatalogFilterBar } from './filterbar';
import { CatalogFilterContext, type CatalogFilter } from './filtercontext';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    const filterContext = useState<CatalogFilter>({});
    return (
        <CatalogFilterContext value={filterContext}>
            <div className="catalog-view">
                <CatalogFilterBar />
                <Catalog />
                <Outlet />
            </div>
        </CatalogFilterContext>
    );
}
