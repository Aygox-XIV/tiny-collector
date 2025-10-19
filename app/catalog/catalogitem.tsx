import { NavLink } from 'react-router';
import { useDatabase } from '../database';

export interface CatalogItemProps {
    id: string;
}

/** element in the catalog list */
export const CatalogItem: React.FC<CatalogItemProps> = ({ id }) => {
    const db = useDatabase();
    const item = db.items[id];
    const detialLink = '/catalog/' + id;
    return (
        <div>
            CatItem: {item?.name}. <NavLink to={detialLink}>details</NavLink>
        </div>
    );
};
