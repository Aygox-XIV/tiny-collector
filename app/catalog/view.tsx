import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { Catalog } from './catalog';
import { CatalogFilterBar } from './filterbar';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="catalog-view">
            <CatalogFilterBar />
            <Catalog />
            <Outlet />
        </div>
    );
}
