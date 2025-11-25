import type { ChangeEvent } from 'react';
import { useFullCollection } from '../collection';
import { useDatabase } from '../database/database';
import { CatalogItem } from './catalogitem';
import { itemMatchesFilter, useCatalogFilter } from './filtercontext';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    const [filter, setFilter] = useCatalogFilter();
    const collection = useFullCollection();
    let itemIds: string[];

    if (filter.catalogView && db.catalogs[filter.catalogView]) {
        itemIds = db.catalogs[filter.catalogView].items;
    } else {
        itemIds = Object.keys(db.items || {});
    }
    let filteredItems: string[] = [];
    itemIds.forEach((id) => {
        if (itemMatchesFilter(db.items[id], collection.items[id], filter)) {
            filteredItems.push(id);
        }
    });
    // TODO: debounce if it's too slow with all data?
    const updateNameFilter = (event: ChangeEvent<HTMLInputElement>) => {
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
                {filter.catalogView && (
                    <div className="catalog-name">
                        <img className="catalog-icon" src={db.catalogs[filter.catalogView].icon} />
                        {db.catalogs[filter.catalogView].name}
                    </div>
                )}
                <div className="catalog-search-content">
                    Filter by name: <input className="catalog-search" onChange={updateNameFilter} />
                </div>
            </div>
            <div className="catalog-content center-content">
                {filteredItems.map((id) => {
                    return <CatalogItem id={id.toString()} key={id} />;
                })}
            </div>
        </div>
    );
};
