import { useCollectedItem } from '../collection';
import { useDatabase } from '../database';

export interface DetailsProps {
    id: string;
}

/** Details panel */
export const Details: React.FC<DetailsProps> = ({ id }) => {
    const db = useDatabase();
    const collection = useCollectedItem(id);
    const item = db.items[id];
    return (
        <div className="details-panel">
            <div className="detail-name">{item.name}</div>
            <div className="detail-icon">icon placeholder</div>
            <div className="detail-status">status (unseen/seen/licensed) placeholder</div>
            <div className="detail-license-data">license progress/input placeholder</div>
            <div className="detail-sources">Sources: {JSON.stringify(item.source)}</div>
        </div>
    );
};
