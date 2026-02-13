import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { CollectedItem } from '../collection';
import type { CatalogType, Category, Item } from '../database/database';

export interface CatalogFilter {
    // Which catalog to view
    readonly catalogView?: CatalogType;
    // Which categories of item to HIDE
    readonly hiddenCategories?: Set<Category>;
    readonly hideUnlicensable?: boolean;
    // Recipe or Collected
    readonly hideCollected?: boolean;
    // hide items with no known source
    readonly hideUnknown?: boolean;
    readonly showOnlyMissingData?: boolean;
    // value of the search bar
    readonly nameMatch?: string;
}

// TODO: show items not in any catalog

export type CatalogFilterState = [CatalogFilter, Dispatch<SetStateAction<CatalogFilter>>];

export const CatalogFilterContext = createContext<CatalogFilterState>([{}, () => undefined]);

export function useCatalogFilter() {
    return useContext(CatalogFilterContext);
}

export function itemMatchesFilter(item: Item, collection: CollectedItem, filter: CatalogFilter): boolean {
    const hasNameFilter = filter.nameMatch && filter.nameMatch.length > 0;
    // empty items maybe present in the catalog for ordering. hide them as soon as anything gets omitted.
    if (!item) {
        if (
            filter.hideCollected ||
            filter.hideUnknown ||
            filter.hideUnlicensable ||
            hasNameFilter ||
            (filter.hiddenCategories && filter.hiddenCategories.size > 0) ||
            filter.showOnlyMissingData
        ) {
            return false;
        }
        return true;
    }
    if (filter.hideUnlicensable && !item.license_amount) {
        return false;
    }
    if (filter.hideCollected) {
        if (collection?.status?.collected) {
            return false;
        }
        if (collection?.status?.haveRecipe && collection?.status?.licensed) {
            return false;
        }
        if (collection?.status?.haveRecipe && !item.license_amount) {
            return false;
        }
        if (collection?.status?.licensed && !item.recipe) {
            return false;
        }
    }
    const missingRecipe = isRecipeMissing(item);
    if (filter.hideUnknown && (!item.source || item.source.length == 0 || missingRecipe)) {
        return false;
    }
    if (filter.showOnlyMissingData && item.source && item.image && !missingRecipe) {
        return false;
    }
    if (filter.hiddenCategories?.has(item.category)) {
        return false;
    }
    try {
        if (hasNameFilter && !item.name.toLowerCase().match(filter.nameMatch)) {
            return false;
        }
    } catch (e) {
        // Fall back to plain substring matching if the regex is invalid.
        if (filter.nameMatch && !item.name.toLowerCase().includes(filter.nameMatch)) {
            return false;
        }
    }
    return true;
}

export function isRecipeMissing(item: Item) {
    return !item.recipe && item.source && item.source.find((s) => s.kind == 'recipe');
}
