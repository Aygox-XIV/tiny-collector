import { NavLink } from 'react-router';
import { useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { ProgressBar } from '../common/progressbar';
import { StatusIcons } from '../common/statusicons';
import { useDatabase } from '../database/database';

export interface CatalogItemProps {
    readonly id: string;
}

/** element in the catalog list */
export const CatalogItem: React.FC<CatalogItemProps> = ({ id }) => {
    const db = useDatabase();
    const collected = useCollectedItem(id);
    const item = db.items[id];
    const detailLink = '/catalog/' + id;
    // TODO: move status icons to be vertical next to the icon to save some vertical space
    return (
        <NavLink to={detailLink}>
            {({ isActive }) => (
                <div className={'catalog-item' + (isActive ? ' active' : '')}>
                    <NameTag name={item.name} />
                    <Icon wiki_path={item.wiki_image_path} />
                    <StatusIcons id={id} />
                    {item.license_amount && (
                        <ProgressBar max={item.license_amount} actual={collected.licenseProgress || 0} />
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
    // TODO: figure out if anything fancy is needed to fit things neatly.
    // maybe the overflow onto the icon is fine though.
    // return (
    //     <svg className="name-tag" viewBox="0 0 240 25">
    //         <text x="0" y="15">
    //             {name}
    //         </text>
    //     </svg>
    // );
};
