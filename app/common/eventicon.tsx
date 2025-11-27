import { BsSun } from 'react-icons/bs';
import { FaRegSnowflake } from 'react-icons/fa';
import { GiPumpkin } from 'react-icons/gi';
import { PiWaves } from 'react-icons/pi';
import { EventCategory } from '../database/sources';

export interface EventIconProps {
    readonly type: EventCategory | null;
    readonly tooltipId: string;
}

export const EventIcon: React.FC<EventIconProps> = ({ type, tooltipId }) => {
    // TODO: include phase number as super/subscript
    let IconChoice;
    switch (type) {
        case EventCategory.EvercoldIsle:
            IconChoice = FaRegSnowflake;
            break;
        case EventCategory.PhantomIsle:
            IconChoice = GiPumpkin;
            break;
        case EventCategory.FloodedExpedition:
            IconChoice = PiWaves;
            break;
        case EventCategory.SunFestival:
            IconChoice = BsSun;
            break;
        default:
            return <div className="source-icon" />;
    }
    return <IconChoice className="source-icon" data-tooltip-id={tooltipId} data-tooltip-content={type} />;
};
