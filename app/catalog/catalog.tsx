import { useDatabase } from '../database/database';
import { CatalogItem } from './catalogitem';
import { useCatalogFilter } from './filtercontext';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    const filter = useCatalogFilter();
    // TODO: apply filter. order properly.
    // TODO: search bar context & filtering
    const items = db.items;
    return (
        <div className="catalog">
            <div className="catalog-search search-bar">Search Bar.</div>
            <div className="catalog-content">
                {Object.keys(items || {}).map((i) => (
                    <CatalogItem id={i} key={i} />
                ))}
            </div>
        </div>
    );
};
