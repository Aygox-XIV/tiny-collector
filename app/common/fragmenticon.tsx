import { HiPuzzlePiece } from 'react-icons/hi2';

export interface FragmentIconProps {
    readonly fragment: boolean;
    readonly tooltipId?: string;
}

export const FragmentIcon: React.FC<FragmentIconProps> = ({ fragment, tooltipId }) => {
    if (fragment) {
        return (
            <HiPuzzlePiece
                className="source-icon"
                data-tooltip-id={tooltipId || 'no-tooltip'}
                data-tooltip-content="Fragment"
            />
        );
    } else {
        return <div className="source-icon" />;
    }
};
