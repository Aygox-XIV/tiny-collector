import { CiUnlock } from 'react-icons/ci';
import { LuScrollText } from 'react-icons/lu';
import { TbMoneybag } from 'react-icons/tb';
import type { DropKind } from '../database/sources';

export interface KindIconProps {
    readonly kind: DropKind;
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
        case 'unlock':
            IconChoice = CiUnlock;
            break;
    }
    return (
        <IconChoice className="source-icon" data-tooltip-id={tooltipId || 'no-tooltip'} data-tooltip-content={kind} />
    );
};
