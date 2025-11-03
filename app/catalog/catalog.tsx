import type { ChangeEvent } from 'react';
import { useDatabase, type Item } from '../database/database';
import { CatalogItem } from './catalogitem';
import { itemMatchesFilter, useCatalogFilter } from './filtercontext';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    const [filter, setFilter] = useCatalogFilter();
    // TODO: order properly?
    const allItems = db.items || {};
    let filteredItems: Item[] = [];
    Object.keys(allItems).forEach((id) => {
        if (itemMatchesFilter(allItems[id], filter)) {
            filteredItems.push(allItems[id]);
        }
    });
    // TODO: debounce if it's too slow with all data?
    const updateFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        if (!newValue || newValue == '') {
            setFilter({ ...filter, nameMatch: undefined });
        } else {
            setFilter({ ...filter, nameMatch: newValue.toLowerCase() });
        }
    };

    return (
        <div className="catalog">
            <div className="catalog-search search-bar">
                <div className="catalog-search-content">
                    Filter by name: <input className="catalog-search" onChange={updateFilter} />
                </div>
            </div>
            <div className="catalog-content">
                {filteredItems.map((item) => {
                    return <CatalogItem id={item.id.toString()} key={item.id} />;
                })}
            </div>
        </div>
    );
};
