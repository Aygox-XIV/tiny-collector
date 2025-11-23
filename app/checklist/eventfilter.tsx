import { GiCheckMark, GiCrossMark } from 'react-icons/gi';
import { EventCategory } from '../database/sources';
import type { NoProps } from '../util';
import { useSourceFilter } from './filtercontext';

export const ChecklistEventFilterBar: React.FC<NoProps> = ({}) => {
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
                <ChecklistOptions />
            </div>
        </div>
    );
};

interface EventProps {
    readonly event: EventCategory;
}

const EventSelector: React.FC<EventProps> = ({ event }) => {
    const [filter, setFilter] = useSourceFilter();
    const selectionClass = filter.event === event ? 'selected' : 'unselected';
    const toggleEvent = function () {
        if (filter.event === event) {
            setFilter({ ...filter, event: undefined });
        } else {
            setFilter({ ...filter, event });
        }
    };
    let iconPath = '/autolog.png';
    switch (event) {
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
    return <img src={iconPath} className={'event-selector ' + selectionClass} onClick={toggleEvent} />;
};

const ChecklistOptions: React.FC<NoProps> = ({}) => {
    const [filter, setFilter] = useSourceFilter();
    const toggleHideCompleted = function () {
        setFilter({ ...filter, hideCompleted: !filter.hideCompleted });
    };
    const Checkmark = filter.hideCompleted ? GiCheckMark : GiCrossMark;
    return (
        <div className="toggle-row" onClick={toggleHideCompleted}>
            Hide completed: <Checkmark className={filter.hideCompleted ? 'selected' : 'unselected'} />
        </div>
    );
};
