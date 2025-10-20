import { useDatabase } from '../database';

export interface DetailsProps {
    id: number;
}

/** Details panel */
export const Details: React.FC<DetailsProps> = ({ id }) => {
    const db = useDatabase();
    const item = db.items[id];
    return <div className="details-panel">Details: {item?.name}</div>;
};
