import { useDatabase } from '../database';
import { CatalogItem } from './catalogitem';

export interface CatalogProps {}

export const Catalog: React.FC<CatalogProps> = ({}) => {
    const db = useDatabase();
    // TODO: apply filter (need filter context around bar + catalog)
    const items = db.items;
    return (
        <div className="catalog">
            Full Catalog:
            {Object.keys(items || {}).map((i) => (
                <CatalogItem id={i} key={i} />
            ))}
        </div>
    );
};
