import { createContext, useContext } from 'react';

export interface StyleInfo {
    readonly smallScreen?: boolean;
}

export type StyleInfoState = [StyleInfo, (info: StyleInfo) => void];

export const StyleInfoContext = createContext<StyleInfoState>([{}, () => undefined]);

export function useSmallScreenStyle(): boolean {
    const [styleInfo] = useContext(StyleInfoContext);
    return !!styleInfo.smallScreen;
}

export function useStyleClass(): string {
    return useSmallScreenStyle() ? ' small' : ' desktop';
}
