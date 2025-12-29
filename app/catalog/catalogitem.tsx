import { NavLink } from 'react-router';
import { useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { ItemName } from '../common/itemname';
import { ProgressBar } from '../common/progressbar';
import { StatusIcons } from '../common/statusicons';
import { useDatabase } from '../database/database';

export interface CatalogItemProps {
    readonly id: string;
    readonly guess?: boolean;
}

/** element in the catalog list */
export const CatalogItem: React.FC<CatalogItemProps> = ({ id, guess }) => {
    const db = useDatabase();
    const collectedState = useCollectedItem(id);
    const item = db.items[id];
    if (!item) {
        return <div className="catalog-item empty-item" />;
    }
    let collectionStateClass = '';
    if (!item.source || item.source.length == 0) {
        collectionStateClass = ' missing-source';
    } else if (
        (collectedState.status.haveRecipe && collectedState.status.licensed) ||
        (collectedState.status.licensed && !item.recipe) ||
        (collectedState.status.haveRecipe && !item.license_amount) ||
        collectedState.status.collected
    ) {
        collectionStateClass = ' complete';
    } else if (collectedState.status.haveRecipe) {
        collectionStateClass = ' with-recipe';
    } else if (collectedState.status.licensed) {
        collectionStateClass = ' with-license';
    } else {
        collectionStateClass = ' missing';
    }
    if (guess) {
        collectionStateClass += ' catalog-guess';
    }
    const detailLink = '/catalog/' + id;
    // TODO: move status icons to be vertical next to the icon to save some vertical space
    return (
        <NavLink to={detailLink}>
            {({ isActive }) => (
                <div className={'catalog-item' + (isActive ? ' active' : '') + collectionStateClass}>
                    <ItemName item={item} />
                    <Icon src={item.image} />
                    <StatusIcons id={id} />
                    {item.license_amount && (
                        <ProgressBar
                            max={item.license_amount}
                            actual={collectedState.licenseProgress}
                            autoMax={collectedState.status.licensed}
                        />
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
