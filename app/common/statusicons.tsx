import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { TbChefHat, TbChefHatOff, TbLicense, TbLicenseOff } from 'react-icons/tb';
import { setCollected, setHaveRecipe, setLicensed, useCollectedItem } from '../collection';
import { isCollectable, useDatabase } from '../database/database';
import { useAppDispatch } from '../store';

export interface StatusIconProps {
    readonly id: string;
    readonly tooltipId?: string;
}

export const StatusIcons: React.FC<StatusIconProps> = ({ id, tooltipId }) => {
    const dbItem = useDatabase().items[id];

    // TODO: move them next to the icon stacked vertically
    // TODO: better markers for no-recipe & unlicensable items?

    return (
        <div className="status-icons">
            {dbItem.recipe && <RecipeStatusIcon id={id} tooltipId={tooltipId} />}
            {dbItem.license_amount && <LicenseStatusIcon id={id} tooltipId={tooltipId} />}
            {isCollectable(dbItem) && <CollectableStatusIcon id={id} tooltipId={tooltipId} />}
        </div>
    );
};

export interface SingleIconProps {
    readonly id: string;
    readonly tooltipId?: string;
}

export const RecipeStatusIcon: React.FC<SingleIconProps> = ({ id, tooltipId }) => {
    const haveRecipe = useCollectedItem(id).status.haveRecipe;
    const dispatch = useAppDispatch();
    const IconType = haveRecipe ? TbChefHat : TbChefHatOff;
    function toggleRecipe() {
        dispatch(setHaveRecipe({ id, newValue: !haveRecipe }));
    }
    return (
        <IconType
            className={'status-icon ' + (haveRecipe ? 'selected' : 'unselected')}
            onClick={toggleRecipe}
            data-tooltip-id={tooltipId || 'no-tooltip'}
            data-tooltip-content="Toggle recipe collection status"
        />
    );
};

export const LicenseStatusIcon: React.FC<SingleIconProps> = ({ id, tooltipId }) => {
    const licensed = useCollectedItem(id).status.licensed;
    const dispatch = useAppDispatch();
    const IconType = licensed ? TbLicense : TbLicenseOff;
    function toggleLicense() {
        // Since it's extremely rare to license an item without having 100% progress, the license amount could be maxed.
        // (in practice this only happens if the license amount is updated after it has already been licensed)
        // However, just let the displayed license amount for licensed items be the max instead so we can cheaply
        // guard against misclicks.
        dispatch(setLicensed({ id, newValue: !licensed }));
    }
    return (
        <IconType
            className={'status-icon ' + (licensed ? 'selected' : 'unselected')}
            onClick={toggleLicense}
            data-tooltip-id={tooltipId || 'no-tooltip'}
            data-tooltip-content="Toggle licensed status"
        />
    );
};

export const CollectableStatusIcon: React.FC<SingleIconProps> = ({ id, tooltipId }) => {
    const collected = useCollectedItem(id).status.collected;
    const dispatch = useAppDispatch();
    const IconType = collected ? HiOutlineCheck : HiOutlineX;
    function toggleCollected() {
        dispatch(setCollected({ id, newValue: !collected }));
    }
    return (
        <IconType
            className={'status-icon ' + (collected ? 'selected' : 'unselected')}
            onClick={toggleCollected}
            data-tooltip-id={tooltipId || 'no-tooltip'}
            data-tooltip-content="Toggle collected status"
        />
    );
};
