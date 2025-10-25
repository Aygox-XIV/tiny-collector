import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LuScrollText } from 'react-icons/lu';
import type { ItemStatus } from '../collection';

export interface StatusIconProps {
    readonly status: ItemStatus;
}

export const StatusIcons: React.FC<StatusIconProps> = ({ status }) => {
    return (
        <div className="status-icons">
            <FaEyeSlash className={'status-icon ' + (!status || status == 'unseen' ? 'selected' : 'unselected')} />
            <FaEye className={'status-icon ' + (status == 'seen' ? 'selected' : 'unselected')} />
            <LuScrollText className={'status-icon ' + (status == 'licensed' ? 'selected' : 'unselected')} />
        </div>
    );
};
