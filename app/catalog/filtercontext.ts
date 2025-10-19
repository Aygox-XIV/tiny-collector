import { createContext, useContext } from 'react';

export interface CatalogFilterState {
    readonly hasRecipe?: boolean;
}

export const CatalogFilterContext = createContext<CatalogFilterState>({});

export function useCatalogFilter() {
    return useContext(CatalogFilterContext);
}
