import { Outlet } from 'react-router';
import { useSmallScreenStyle } from '../style';
import type { Route } from './+types/view';
import { Catalog } from './catalog';
import { CatalogFilterBar } from './filterbar';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    const smallScreen = useSmallScreenStyle();
    return (
        <div className="catalog-view">
            <CatalogFilterBar />
            {(!smallScreen || params.iid === undefined) && <Catalog />}
            <Outlet />
        </div>
    );
}
