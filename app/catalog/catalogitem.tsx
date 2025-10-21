import { BsQuestionSquare } from 'react-icons/bs';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LuScrollText } from 'react-icons/lu';
import { NavLink } from 'react-router';
import { useCollectedItem } from '../collection';
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
                    <StatusIcon status={collected.licensed ? 'licensed' : collected.seen ? 'seen' : 'unseen'} />
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

interface IconProp {
    readonly wiki_path?: string;
}

const Icon: React.FC<IconProp> = ({ wiki_path }) => {
    if (wiki_path) {
        return (
            <img
                className="catalog-item-icon"
                src={'https://static.wikia.nocookie.net/tiny-shop/images/' + wiki_path}
            />
        );
    }
    return <BsQuestionSquare />;
};

interface StatusIconProps {
    readonly status: 'unseen' | 'seen' | 'licensed';
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
    switch (status) {
        case 'unseen':
            return <FaEyeSlash />;
        case 'seen':
            return <FaEye />;
        case 'licensed':
            return <LuScrollText />;
    }
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
