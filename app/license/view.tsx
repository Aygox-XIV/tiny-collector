import type { Route } from './+types/view';
import { LicenseCalatogFilterBar } from './catalogfilter';
import { LicenseList } from './licenselist';

export default function CatalogView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="license-view center-content">
            <LicenseCalatogFilterBar />
            <LicenseList />
        </div>
    );
}
