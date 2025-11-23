import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { EventCategory, SourceType } from '../database/sources';

export interface SourceFilter {
    readonly hiddenEvents?: Set<EventCategory>;
    readonly hiddenTypes?: Set<SourceType>;
    readonly hideCompleted?: boolean;
}

export type SourceFilterState = [SourceFilter, Dispatch<SetStateAction<SourceFilter>>];

export const SourceFilterContext = createContext<SourceFilterState>([{}, () => undefined]);

export function useSourceFilter() {
    return useContext(SourceFilterContext);
}
