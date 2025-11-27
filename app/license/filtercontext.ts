import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { CatalogType } from '../database/database';

export interface LicenseFilter {
    readonly hiddenCatalogs?: Set<CatalogType>;
    readonly hideUncollectedItems?: boolean;
    readonly hidePremiumItems?: boolean;
}

export type LicenseFilterState = [LicenseFilter, Dispatch<SetStateAction<LicenseFilter>>];

export const LicenseFilterContext = createContext<LicenseFilterState>([{}, () => undefined]);

export function useLicenseFilter() {
    return useContext(LicenseFilterContext);
}
