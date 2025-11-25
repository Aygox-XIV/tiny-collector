import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { TbChefHat, TbChefHatOff, TbLicense, TbLicenseOff } from 'react-icons/tb';
import { changeStatus, useCollectedItem } from '../collection';
import { isCollectable, useDatabase } from '../database/database';
import { useAppDispatch } from '../store';

export interface StatusIconProps {
    readonly id: string;
}

export const StatusIcons: React.FC<StatusIconProps> = ({ id }) => {
    const status = useCollectedItem(id).status;
    const dispatch = useAppDispatch();
    const dbItem = useDatabase().items[id];
    function toggleRecipe() {
        dispatch(changeStatus({ id, status: { ...status, haveRecipe: !status.haveRecipe } }));
    }
    function toggleLicense() {
        // Since it's extremely rare to license an item without having 100% progress, the license amount could be maxed.
        // (in practice this only happens if the license amount is updated after it has already been licensed)
        // However, just let the displayed license amount for licensed items be the max instead so we can cheaply
        // guard against misclicks.
        dispatch(changeStatus({ id, status: { ...status, licensed: !status.licensed } }));
    }
    function toggleCollected() {
        dispatch(changeStatus({ id, status: { ...status, collected: !status.collected } }));
    }

    // TODO: tooltips/ move them next to the icon stacked vertically
    // TODO: better markers for no-recipe & unlicensable items?

    return (
        <div className="status-icons">
            {dbItem.recipe && <RecipeStatusIcon selected={status?.haveRecipe} onClick={toggleRecipe} />}
            {dbItem.license_amount && <LicenseStatusIcon selected={status?.licensed} onClick={toggleLicense} />}
            {isCollectable(dbItem) && <CollectableStatusIcon selected={status?.collected} onClick={toggleCollected} />}
        </div>
    );
};

export interface SingleIconProps {
    readonly selected?: boolean;
    readonly onClick: () => void;
}

export const RecipeStatusIcon: React.FC<SingleIconProps> = ({ selected, onClick }) => {
    const IconType = selected ? TbChefHat : TbChefHatOff;
    return <IconType className={'status-icon ' + (selected ? 'selected' : 'unselected')} onClick={onClick} />;
};

export const LicenseStatusIcon: React.FC<SingleIconProps> = ({ selected, onClick }) => {
    const IconType = selected ? TbLicense : TbLicenseOff;
    return <IconType className={'status-icon ' + (selected ? 'selected' : 'unselected')} onClick={onClick} />;
};

export const CollectableStatusIcon: React.FC<SingleIconProps> = ({ selected, onClick }) => {
    const IconType = selected ? HiOutlineCheck : HiOutlineX;
    return <IconType className={'status-icon ' + (selected ? 'selected' : 'unselected')} onClick={onClick} />;
};
