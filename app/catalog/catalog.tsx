import { useDatabase } from '../database';
import { CatalogItem } from './catalogitem';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    // TODO: apply filter
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
