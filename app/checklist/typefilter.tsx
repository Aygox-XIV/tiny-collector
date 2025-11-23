import { SourceTypeIcon } from '../common/sourceicon';
import { SourceType } from '../database/sources';
import type { NoProps } from '../util';
import { useSourceFilter } from './filtercontext';

export const ChecklistTypeFilterBar: React.FC<NoProps> = ({}) => {
    // TODO: hide types that the currently-selected event does not have

    return (
        <div className="type-filter vert-filter-bar">
            Categories:
            {Object.values(SourceType).map((t) => {
                return <SourceTypeSelector key={t} type={t as SourceType} />;
            })}
        </div>
    );
};

interface SourceTypeProps {
    readonly type: SourceType;
}

const SourceTypeSelector: React.FC<SourceTypeProps> = ({ type }) => {
    const [filter, setFilter] = useSourceFilter();

    const toggleCategory = function (t: SourceType) {
        let hiddenTypes = filter.hiddenTypes || new Set();
        if (hiddenTypes.has(t)) {
            hiddenTypes.delete(t);
        } else {
            hiddenTypes.add(t);
        }
        setFilter({ ...filter, hiddenTypes });
    };
    return (
        <div className="toggle-row" onClick={() => toggleCategory(type)}>
            <SourceTypeIcon
                type={type}
                extraClasses={'toggle-select-icon ' + (filter.hiddenTypes?.has(type) ? 'unselected' : 'selected')}
            />{' '}
            {readableName(type)}
        </div>
    );
};

function readableName(t: SourceType): string {
    switch (t) {
        case SourceType.Battle:
            return 'Battles';
        case SourceType.Boutique:
            return 'Boutique';
        case SourceType.City:
            return 'City';
        case SourceType.Combine:
            return 'Combining';
        case SourceType.EventMarket:
            return 'Event Markets';
        case SourceType.Feat:
            return 'Feats';
        case SourceType.Harvest:
            return 'Harvesting';
        case SourceType.Journey:
            return 'Journeys';
        case SourceType.Market:
            return 'Material Market';
        case SourceType.MissionReward:
            return 'Mission Rewards';
        case SourceType.Outpost:
            return 'Outposts';
        case SourceType.PremiumPack:
            return 'Premium Packs';
        case SourceType.Shifty:
            return 'Shifty';
        case SourceType.ShopLevel:
            return 'Shop Level';
        case SourceType.Task:
            return 'Tasks';
        case SourceType.TaskChest:
            return 'Task Chests';
        default:
            return 'untyped ' + t;
    }
}
