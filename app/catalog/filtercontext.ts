import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { CollectedItem } from '../collection';
import type { Item } from '../database/database';

export type LicenseFilter = 'none' | 'licensable' | 'unlicensed';

export interface CatalogFilter {
    // Which catalog to view
    readonly catalogView?: string;
    // everything in the view, only licensable, or only not-yet-licensed
    readonly licenseFilter?: LicenseFilter;
    // value of the search bar
    readonly nameMatch?: string;
}

export type CatalogFilterState = [CatalogFilter, Dispatch<SetStateAction<CatalogFilter>>];

export const CatalogFilterContext = createContext<CatalogFilterState>([{}, () => undefined]);

export function useCatalogFilter() {
    return useContext(CatalogFilterContext);
}

export function itemMatchesFilter(item: Item, collection: CollectedItem, filter: CatalogFilter): boolean {
    if (filter.licenseFilter) {
        if (filter.licenseFilter == 'licensable' && !item.license_amount) {
            return false;
        }
        if (filter.licenseFilter == 'unlicensed') {
            if (!item.license_amount) {
                return false;
            }
            if ((collection.licenseProgress || 0) >= item.license_amount) {
                return false;
            }
        }
    }
    if (filter.nameMatch && !item.name.toLowerCase().match(filter.nameMatch)) {
        return false;
    }
    return true;
}
