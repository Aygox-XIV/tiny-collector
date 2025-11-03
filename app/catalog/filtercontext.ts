import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { Item } from '../database/database';

export interface CatalogFilter {
    readonly hasRecipe?: boolean;
    readonly nameMatch?: string;
}

export type CatalogFilterState = [CatalogFilter, Dispatch<SetStateAction<CatalogFilter>>];

export const CatalogFilterContext = createContext<CatalogFilterState>([{}, () => undefined]);

export function useCatalogFilter() {
    return useContext(CatalogFilterContext);
}

export function itemMatchesFilter(item: Item, filter: CatalogFilter): boolean {
    if (filter.hasRecipe && !item.recipe) {
        return false;
    }
    if (filter.nameMatch && !item.name.toLowerCase().match(filter.nameMatch)) {
        return false;
    }
    return true;
}
