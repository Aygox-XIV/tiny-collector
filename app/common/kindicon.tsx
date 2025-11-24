import { LuScrollText } from 'react-icons/lu';
import { TbMoneybag } from 'react-icons/tb';

export interface KindIconProps {
    readonly kind: 'item' | 'recipe';
    readonly tooltipId?: string;
}
export const KindIcon: React.FC<KindIconProps> = ({ kind, tooltipId }) => {
    let IconChoice;
    switch (kind) {
        case 'item':
            IconChoice = TbMoneybag;
            break;
        case 'recipe':
            IconChoice = LuScrollText;
            break;
    }
    return (
        <IconChoice className="source-icon" data-tooltip-id={tooltipId || 'no-tooltip'} data-tooltip-content={kind} />
    );
};
