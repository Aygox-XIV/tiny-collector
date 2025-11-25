import { GiCheckMark } from 'react-icons/gi';
import { HiOutlineX } from 'react-icons/hi';

export interface ToggleProps {
    readonly text: string;
    readonly checked?: boolean;
    readonly onClick: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ text, checked, onClick }) => {
    const Checkmark = checked ? GiCheckMark : HiOutlineX;
    return (
        <div className="toggle-row checkmark-toggle" onClick={onClick}>
            <span>{text}</span> <Checkmark className={checked ? 'selected' : 'unselected'} />
        </div>
    );
};
