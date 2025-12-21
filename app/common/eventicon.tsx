import { BsSun } from 'react-icons/bs';
import { FaRegSnowflake } from 'react-icons/fa';
import { GiPumpkin } from 'react-icons/gi';
import { PiWaves } from 'react-icons/pi';
import { EventCategory, EventType, eventTypeToCategory, getEventPhase } from '../database/sources';

export interface EventIconProps {
    readonly type?: EventType;
    readonly showEventPhase?: boolean;
    readonly tooltipId: string;
}

export const EventIcon: React.FC<EventIconProps> = ({ type, showEventPhase, tooltipId }) => {
    // TODO: expand to also show "mission-specific" status
    let IconChoice;
    switch (eventTypeToCategory(type)) {
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

    const phase = getEventPhase(type);

    // TODO: figure something out for the phase number in the catalog source list. (maybe just make those icons bigger)
    if (showEventPhase) {
        return (
            <div className="source-icon-wrapper">
                <IconChoice className="source-icon" data-tooltip-id={tooltipId} data-tooltip-content={type} />
                {phase && <div className="source-icon-phase-num">{phase}</div>}
            </div>
        );
    } else {
        return <IconChoice className="source-icon" data-tooltip-id={tooltipId} data-tooltip-content={type} />;
    }
};
