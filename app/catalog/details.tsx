import { NavLink } from 'react-router';
import { setLicenseAmount, useCollectedItem } from '../collection';
import { Icon } from '../common/icon';
import { ItemName } from '../common/itemname';
import { EditingProgressBar } from '../common/progressbar';
import { StatusIcons } from '../common/statusicons';
import { useDatabase, type Item } from '../database/database';
import { useAppDispatch } from '../store';
import { SourceList } from './sourcelist';

export interface DetailsProps {
    readonly id: string;
}

/** Details panel */
export const Details: React.FC<DetailsProps> = ({ id }) => {
    const db = useDatabase();
    const collectionDetails = useCollectedItem(id);
    const dispatch = useAppDispatch();
    const item = db.items[id];

    // TODO: debounce if it's being changed through scrolling?
    const updateLicenseAmount = (newValue: number) => {
        const clampedValue = Math.max(Math.min(newValue, item.license_amount || newValue), 0);
        dispatch(setLicenseAmount({ id, amount: clampedValue }));
    };

    // TODO: describe best way to report new findings when no sources are listed
    // TODO: recipe next to the icon, items link to item details
    return (
        <div className="details-panel">
            <ItemName item={item} />
            <div className="icon-and-recipe">
                <Icon src={item.image} />
                <RecipeOveriew item={item} />
            </div>
            <StatusIcons id={id} />
            {item.license_amount && (
                <div className="detail-license-data">
                    <EditingProgressBar
                        max={item.license_amount}
                        actual={collectionDetails.licenseProgress}
                        autoMax={collectionDetails.status.licensed}
                        edit={updateLicenseAmount}
                    />
                </div>
            )}
            {item.source && <SourceList sources={item.source} />}
            {!item.source && <div className="no-source">No catalogued (or known) sources.</div>}
        </div>
    );
};

interface RecipeProps {
    readonly item: Item;
}

const RecipeOveriew: React.FC<RecipeProps> = ({ item }) => {
    if (!item.recipe) {
        return <div className="invis" />;
    }
    return (
        <div className="recipe-overview">
            Recipe for {item.recipe.craft_amount}:
            <div className="ingredients-container">
                {item.recipe.ingredient.map((i) => {
                    return <SingleIngredient id={i.id} quantity={i.quantity} key={i.id} />;
                })}
            </div>
        </div>
    );
};

interface IngredientProps {
    readonly id: number;
    readonly quantity: number;
}

const SingleIngredient: React.FC<IngredientProps> = ({ id, quantity }) => {
    const db = useDatabase();
    const item = db.items[id];
    return (
        <NavLink to={'/catalog/' + id} className="single-ingredient">
            <Icon src={item.image} />
            <div className="ingredient-text">
                {item.name} x {quantity}
            </div>
        </NavLink>
    );
};
