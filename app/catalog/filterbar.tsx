import { useDatabase, type Category } from '../database/database';
import { useCatalogFilter } from './filtercontext';

export interface CatalogFilterBarProps {}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({}) => {
    const [filter, setFilter] = useCatalogFilter();
    const db = useDatabase();

    // TODO: hover text
    const setCatalog = function (key: string) {
        if (filter.catalogView == key) {
            setFilter({ ...filter, catalogView: undefined });
        } else {
            setFilter({ ...filter, catalogView: key });
        }
    };
    const toggleCategory = function (cat: Category) {
        let cats = filter.categoryFilter || new Set();
        if (cats.has(cat)) {
            cats.delete(cat);
        } else {
            cats.add(cat);
        }
        setFilter({ ...filter, categoryFilter: cats });
    };

    const selectedClass = function (selected: boolean) {
        return selected ? ' selected' : ' unselected';
    };
    // TODO: prune available category selection based on catalog
    return (
        <div className="catalog-filter">
            Catalog Type:
            <div className="catalog-type-selection">
                {Object.keys(db.catalogs).map((key) => {
                    return (
                        <img
                            src={db.catalogs[key].icon}
                            className={'catalog-icon' + selectedClass(filter.catalogView === key)}
                            onClick={() => setCatalog(key)}
                        />
                    );
                })}
            </div>
            <div className="item-type-selection">Item categories:</div>
            <div className="collection-selection">coll options</div>
        </div>
    );
};
