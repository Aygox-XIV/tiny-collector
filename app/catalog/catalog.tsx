import type { ChangeEvent } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { useFullCollection } from '../collection';
import { getImgSrc, useDatabase } from '../database/database';
import { CatalogItem } from './catalogitem';
import { itemMatchesFilter, useCatalogFilter } from './filtercontext';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    const [filter, setFilter] = useCatalogFilter();
    const collection = useFullCollection();
    let itemIds: string[];

    if (filter.catalogView && db.catalogs[filter.catalogView]) {
        const itemNameList = db.catalogs[filter.catalogView].items;
        itemIds = [];
        for (const [id, _] of itemNameList) {
            itemIds.push(id);
        }
    } else {
        itemIds = Object.keys(db.items || {});
    }
    let filteredItems: string[] = [];
    let blankCounter = 0; // if there's >1 blank, don't require the catalog to keep those blanks unique to hide react warnings
    itemIds.forEach((id) => {
        if (itemMatchesFilter(db.items[id], collection.items[id], filter)) {
            filteredItems.push(id.charAt(0) == '-' ? (--blankCounter).toString() : id);
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
                        <img className="catalog-icon" src={getImgSrc(db.catalogs[filter.catalogView].icon)} />
                        {db.catalogs[filter.catalogView].name}
                    </div>
                )}
                <div className="catalog-search-content">
                    Filter by name:{' '}
                    <input
                        id="catalog-search"
                        className="catalog-search"
                        onChange={updateNameFilter}
                        value={filter.nameMatch || ''}
                    />
                    <HiOutlineX
                        onClick={() => {
                            setFilter({ ...filter, nameMatch: undefined });
                        }}
                    />
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
