import { BiEdit } from 'react-icons/bi';
import { useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { ProgressBar } from '../common/progressbar';
import { StatusIcons } from '../common/statusicons';
import { useDatabase } from '../database/database';
import { SourceList } from './sourcelist';

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
            <Icon wiki_path={item.wiki_image_path} />
            <StatusIcons id={id} />
            {item.license_amount && (
                <div className="detail-license-data">
                    <ProgressBar max={item.license_amount} actual={collection?.licenceProgress || 0} />
                    <BiEdit />
                </div>
            )}
            {item.source && <SourceList sources={item.source} />}
            {!item.source && <div className="no-source">No catalogued (or known) sources</div>}
        </div>
    );
};
