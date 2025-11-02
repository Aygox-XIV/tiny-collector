import { TbChefHat, TbChefHatOff, TbLicense, TbLicenseOff } from 'react-icons/tb';
import { changeStatus, useCollectedItem } from '../collection';
import { useAppDispatch } from '../store';

export interface StatusIconProps {
    readonly id: string;
}

export const StatusIcons: React.FC<StatusIconProps> = ({ id }) => {
    const status = useCollectedItem(id).status;
    const dispatch = useAppDispatch();
    function toggleRecipe() {
        dispatch(changeStatus({ id, status: { ...status, haveRecipe: !status.haveRecipe } }));
    }
    function toggleLicense() {
        dispatch(changeStatus({ id, status: { ...status, licensed: !status.licensed } }));
    }

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
