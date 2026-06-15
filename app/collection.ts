import { useAppSelector } from './store';

export interface Collection {
    readonly items: Record<string, CollectedItem>;
    readonly smallScreen?: boolean;
    // TODO: version number?
    // For now: Sample data will have IDs < 100, real data >= 100
    readonly initialized?: boolean;
}

export interface ItemStatus {
    // For craftable/sellable items
    readonly haveRecipe?: boolean;
    readonly licensed?: boolean;
    // For decor, quest items, etc
    readonly collected?: boolean;
}

export interface CollectedItem {
    // TODO: needed? or just duplicate?
    readonly id: string;
    readonly status: ItemStatus;
    readonly licenseProgress?: number;
    readonly storageAmount?: number;
}

export function defaultCollectionState(id: string): CollectedItem {
    return { id, status: {} };
}

export function useFullCollection(): Collection {
    return useAppSelector((state) => state.collection);
}

export function useCollectionInitialized(): boolean {
    return useAppSelector((state) => state?.collection?.initialized || false);
}

export function useCollectedItem(id: string): CollectedItem {
    const item = useAppSelector((state) => state.collection.items[id]);
    return item || defaultCollectionState(id);
}
