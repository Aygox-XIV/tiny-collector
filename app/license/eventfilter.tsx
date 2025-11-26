import { EventCategory } from '../database/sources';
import type { NoProps } from '../util';
import { useLicenseFilter } from './filtercontext';

export const LicenseEventFilterBar: React.FC<NoProps> = ({}) => {
    return (
        <div className="event-filter vert-filter-bar">
            Event Type:
            <div className="event-selection">
                {Object.values(EventCategory).map((c) => {
                    return <EventSelector key={c} event={c as EventCategory} />;
                })}
            </div>
            <br />
            <br />
            <br />
            Click to select, click again to select all. Hold Ctrl to add to or remove from the selection.
        </div>
    );
};

interface EventProps {
    readonly event: EventCategory;
}

const EventSelector: React.FC<EventProps> = ({ event }) => {
    const [filter, setFilter] = useLicenseFilter();
    const selectionClass = filter.hiddenEvents?.has(event) ? 'unselected' : 'selected';
    let iconPath = '/autolog.png';
    switch (event) {
        case EventCategory.NoEvent:
            iconPath = '/autolog.png';
            break;
        case EventCategory.EvercoldIsle:
            iconPath = '/catalog_evercold.png';
            break;
        case EventCategory.FloodedExpedition:
            iconPath = '/catalog_fe.png';
            break;
        case EventCategory.PhantomIsle:
            iconPath = '/catalog_phantom.png';
            break;
        case EventCategory.SunFestival:
            iconPath = '/catalog_sf.png';
            break;
    }
    function handleEventClick(clickEvent: React.MouseEvent<HTMLImageElement, MouseEvent>): void {
        if (clickEvent.ctrlKey.valueOf()) {
            let hiddenEvents = filter.hiddenEvents || new Set();
            if (hiddenEvents.has(event)) {
                hiddenEvents.delete(event);
            } else {
                hiddenEvents.add(event);
            }
            setFilter({ ...filter, hiddenEvents });
        } else {
            let hiddenEvents = filter.hiddenEvents || new Set();
            if (hiddenEvents.size == Object.values(EventCategory).length - 1 && !hiddenEvents.has(event)) {
                setFilter({ ...filter, hiddenEvents: new Set() });
            } else {
                hiddenEvents = new Set();
                Object.values(EventCategory).forEach((e) => {
                    hiddenEvents.add(e as EventCategory);
                });
                hiddenEvents.delete(event);
                setFilter({ ...filter, hiddenEvents });
            }
        }
    }

    return <img src={iconPath} className={'event-selector ' + selectionClass} onClick={handleEventClick} />;
};
