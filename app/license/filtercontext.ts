import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { EventCategory } from '../database/sources';

export interface LicenseFilter {
    readonly hiddenEvents?: Set<EventCategory>;
}

export type LicenseFilterState = [LicenseFilter, Dispatch<SetStateAction<LicenseFilter>>];

export const LicenseFilterContext = createContext<LicenseFilterState>([{}, () => undefined]);

export function useLicenseFilter() {
    return useContext(LicenseFilterContext);
}
