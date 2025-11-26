import { Outlet } from 'react-router';
import type { Route } from './+types/view';
import { LicenseEventFilterBar } from './eventfilter';
import { LicenseList } from './licenselist';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="license-view center-content">
            <LicenseEventFilterBar />
            <LicenseList />
            <Outlet />
        </div>
    );
}
