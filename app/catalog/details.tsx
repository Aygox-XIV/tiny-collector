import { setLicenseAmount, useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { EditingProgressBar } from '../common/progressbar';
import { StatusIcons } from '../common/statusicons';
import { useDatabase } from '../database/database';
import { useAppDispatch } from '../store';
import { SourceList } from './sourcelist';

export interface DetailsProps {
    id: string;
}

/** Details panel */
export const Details: React.FC<DetailsProps> = ({ id }) => {
    const db = useDatabase();
    const collection = useCollectedItem(id);
    const dispatch = useAppDispatch();
    const item = db.items[id];

    // TODO: debounce?
    const updateLicenseAmount = (newValue: number) => {
        const clampedValue = Math.max(Math.min(newValue, item.license_amount || newValue), 0);
        dispatch(setLicenseAmount({ id, amount: clampedValue }));
    };

    return (
        <div className="details-panel">
            <div className="detail-name">{item.name}</div>
            <Icon wiki_path={item.wiki_image_path} />
            <StatusIcons id={id} />
            {item.license_amount && (
                <div className="detail-license-data">
                    <EditingProgressBar
                        max={item.license_amount}
                        actual={collection?.licenseProgress || 0}
                        edit={updateLicenseAmount}
                    />
                </div>
            )}
            {item.source && <SourceList sources={item.source} />}
            {!item.source && <div className="no-source">No catalogued (or known) sources</div>}
        </div>
    );
};
