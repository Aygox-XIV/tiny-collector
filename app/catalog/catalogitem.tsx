import { NavLink } from 'react-router';
import { useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { StatusIcons } from '../common/statusicons';
import { useDatabase } from '../database';

export interface CatalogItemProps {
    readonly id: string;
}

/** element in the catalog list */
export const CatalogItem: React.FC<CatalogItemProps> = ({ id }) => {
    const db = useDatabase();
    const collected = useCollectedItem(id);
    const item = db.items[id];
    const detailLink = '/catalog/' + id;
    return (
        <NavLink to={detailLink}>
            {({ isActive }) => (
                <div className={'catalog-item' + (isActive ? ' active' : '')}>
                    <NameTag name={item.name} />
                    <Icon wiki_path={item.wiki_image_path} />
                    <StatusIcons status={collected.status} />
                    {item.license_amount && (
                        <LicenseBar max={item.license_amount} actual={collected.licenceProgress || 0} />
                    )}
                </div>
            )}
        </NavLink>
    );
};

interface NameTagProps {
    readonly name: string;
}
const NameTag: React.FC<NameTagProps> = ({ name }) => {
    return <div className="name-tag">{name}</div>;
};

interface LicenseBarProps {
    readonly max: number;
    readonly actual: number;
}

const LicenseBar: React.FC<LicenseBarProps> = ({ max, actual }) => {
    // TODO: manual progress bar, to not rely on browser details.
    return (
        <div className="license-bar">
            <progress value={actual} max={max}>
                {actual} / {max}
            </progress>
        </div>
    );
};
