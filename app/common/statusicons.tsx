import { TbChefHat, TbChefHatOff, TbLicense, TbLicenseOff } from 'react-icons/tb';
import { changeStatus, setLicenseAmount, useCollectedItem } from '../collection';
import { useDatabase } from '../database/database';
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
        // It's extremely rare to license an item without having 100% progress, so just max it by default.
        // (in practice this only happens if the license amount is updated after it has already been licensed)
        if (!status.licensed && dbItem.license_amount) {
            dispatch(setLicenseAmount({ id, amount: dbItem.license_amount }));
        }
        dispatch(changeStatus({ id, status: { ...status, licensed: !status.licensed } }));
    }

    // TODO: tooltips/ move them next to the icon stacked vertically

    return (
        <div className="status-icons">
            {(!status || !status.haveRecipe) && (
                <TbChefHatOff className="status-icon unselected" onClick={toggleRecipe} />
            )}
            {status && status.haveRecipe && <TbChefHat className="status-icon selected" onClick={toggleRecipe} />}
            {(!status || !status.licensed) && (
                <TbLicenseOff className="status-icon unselected" onClick={toggleLicense} />
            )}
            {status && status.licensed && <TbLicense className="status-icon selected" onClick={toggleLicense} />}
        </div>
    );
};
