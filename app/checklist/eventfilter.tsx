import { useSearchParams } from 'react-router';
import { Toggle } from '../common/toggle';
import { EventCategory } from '../database/sources';
import type { NoProps } from '../util';
import { useSourceFilter } from './filtercontext';

export const CHECKLIST_EVENT_PARAM = 'e';

export const ChecklistEventFilterBar: React.FC<NoProps> = ({}) => {
    const [filter, setFilter] = useSourceFilter();
    const toggleHideCompleted = function () {
        setFilter({ ...filter, hideCompleted: !filter.hideCompleted });
    };
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
            <div className="checklist-options">
                <Toggle text="Hide completed: " checked={filter.hideCompleted} onClick={toggleHideCompleted} />
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
    const [filter, setFilter] = useSourceFilter();
    const [, setSearchParams] = useSearchParams();
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
            setFilter({ ...filter, hiddenEvents, urlParam: undefined });
            setSearchParams({});
        } else {
            let hiddenEvents = filter.hiddenEvents || new Set();
            if (hiddenEvents.size == Object.values(EventCategory).length - 1 && !hiddenEvents.has(event)) {
                setFilter({ ...filter, hiddenEvents: new Set(), urlParam: undefined });
                setSearchParams({});
            } else {
                hiddenEvents = new Set();
                Object.values(EventCategory).forEach((e) => {
                    hiddenEvents.add(e as EventCategory);
                });
                hiddenEvents.delete(event);
                setFilter({ ...filter, hiddenEvents, urlParam: '?' + CHECKLIST_EVENT_PARAM + '=' + event });
                setSearchParams({ [CHECKLIST_EVENT_PARAM]: event });
            }
        }
    }

    return <img src={iconPath} className={'event-selector ' + selectionClass} onClick={handleEventClick} />;
};
