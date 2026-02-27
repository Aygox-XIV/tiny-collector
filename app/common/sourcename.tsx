import { NavLink } from 'react-router';
import { getEventCategory, SourceType, type Source } from '../database/sources';

interface SourceNameProps {
    readonly source: Source;
    readonly tooltipId?: string;
    readonly disableLinks?: boolean;
}

const NO_TOOLTIP = 'no-tooltip';

export const SourceName: React.FC<SourceNameProps> = ({ source, tooltipId, disableLinks }) => {
    switch (source.type) {
        case SourceType.Battle:
            return (
                <div
                    data-tooltip-id={tooltipId || NO_TOOLTIP}
                    data-tooltip-content="Enemy name"
                    data-tooltip-place="top-start"
                >
                    {source.name}
                </div>
            );
        case SourceType.Boutique:
            if (source.subtype == 'Anniversary') {
                return <div>Obtain from the anniversary boutique during the yearly anniversary event.</div>;
            } else {
                return <div>Buy from the Boutique using Gems</div>;
            }
        case SourceType.City:
            return (
                <div>
                    {source.subtype} at {source.name}
                </div>
            );
        case SourceType.Combine:
            return (
                <div
                    data-tooltip-id={tooltipId || NO_TOOLTIP}
                    data-tooltip-content="Combine fragments for this item"
                    data-tooltip-place="top-start"
                >
                    {disableLinks && source.name}
                    {!disableLinks && <NavLink to={'/catalog/' + source.id}>{source.name}</NavLink>}
                </div>
            );
        case SourceType.EventMarket:
            if (source.name) {
                return (
                    <div>
                        {source.name} from the {source.subtype} event market.
                    </div>
                );
            }
            return <div>Buy from the {source.subtype} event market.</div>;
        case SourceType.Feat:
            return (
                <div
                    data-tooltip-id={tooltipId || NO_TOOLTIP}
                    data-tooltip-content={'Feat category: ' + source.subtype}
                    data-tooltip-place="top-start"
                >
                    Reward for level {source.level} of {source.name}
                </div>
            );
        case SourceType.Harvest:
            return <div>{source.name}</div>;
        case SourceType.Journey:
            return <div>{source.name}</div>;
        case SourceType.Market:
            return <div>Buy from the Materials tab in the standard Market</div>;
        case SourceType.MissionReward:
            return <div>Complete "{source.name}"</div>;
        case SourceType.Outpost:
            return (
                <div>
                    {source.subtype} at <OutpostDescription type={source.name} tooltipId={tooltipId} />
                </div>
            );
        case SourceType.PremiumPack:
            return <div>Buy the "{source.name}" premium pack.</div>;
        case SourceType.Shifty:
            if (source.name) {
                return <div>Exchange for the "{source.name}" at Shifty's Bazaar</div>;
            } else {
                return <div>Exchange directly at Shifty's Bazaar</div>;
            }
        case SourceType.ShopLevel:
            return <div>Reach shop level {source.name}.</div>;
        case SourceType.Task:
            switch (source.subtype) {
                case 'Outpost':
                    return (
                        <div>
                            Complete tasks from <OutpostDescription type={source.name!} tooltipId={tooltipId} />
                        </div>
                    );
                case 'Daily':
                    return <div>Reward from daily tasks.</div>;
                default:
                    return <div>{source.name}</div>;
            }
        case SourceType.TaskChest:
            if (source.subtype === 'Daily') {
                return <div>Reward from daily task chests</div>;
            } else {
                return <div>{source.name}</div>;
            }
        default:
            return <div>Unknown source type for: {JSON.stringify(source)}</div>;
    }
};

export function getSimpleSourceName(source: Source): string {
    switch (source.type) {
        case SourceType.Battle:
            return `Defeat ${source.name} during ${getEventCategory(source)}`;
        case SourceType.Boutique:
            return source.subtype == 'Anniversary' ? 'Anniversary boutique purchase' : 'Boutique purchase';
        case SourceType.City:
            return `${source.subtype} at ${source.name}`;
        case SourceType.Combine:
            return `Combine fragments for ${source.name}`;
        case SourceType.EventMarket:
            return `${getEventCategory(source)} market purchase`;
        case SourceType.Feat:
            return `Complete the ${source.name} feat (Lvl ${source.level})`;
        case SourceType.Harvest:
            return `Harvest ${source.name}`;
        case SourceType.Journey:
            return `Finish journey: ${source.name}`;
        case SourceType.Market:
            return 'Market purchase';
        case SourceType.MissionReward:
            return `Complete mission: ${source.name}`;
        case SourceType.Outpost:
            return `${source.subtype} at ${source.name} outposts`;
        case SourceType.PremiumPack:
            return `Buy the ${source.name}`;
        case SourceType.Shifty:
            return `Shifty's Bazaar`;
        case SourceType.ShopLevel:
            return `Level up your shop to ${source.name}`;
        case SourceType.Task:
            switch (source.subtype) {
                case 'Daily':
                    return 'Complete daily tasks';
                case 'Outpost':
                    return `Complete tasks from ${source.name} outposts`;
                default:
                    return `Complete task: ${source.name} during ${getEventCategory(source)}`;
            }
        case SourceType.TaskChest:
            return `Open a ${source.subtype} task chest`;
    }
}

interface OutpostTypeProp {
    readonly type: string;
    readonly tooltipId?: string;
}

const OutpostDescription: React.FC<OutpostTypeProp> = ({ type, tooltipId }) => {
    let availableOutposts = 'Unknown -- corrupted data: type ' + type;
    switch (type) {
        case 'Trading':
            availableOutposts = 'Shimmery, Azur, Sunbound, Refuge';
            break;
        case 'Coastal':
            availableOutposts = 'Azur, Sunbound, Refuge';
            break;
        case 'Naturalist':
            availableOutposts = 'Azur, Sunbound';
            break;
        case 'Archeologist':
            availableOutposts = 'Refuge';
            break;
    }
    return (
        <span>
            <span
                data-tooltip-id={tooltipId || NO_TOOLTIP}
                data-tooltip-content={'Outposts that can have this occupation: ' + availableOutposts}
                data-tooltip-place="top-start"
                className={tooltipId ? 'text-with-tt' : NO_TOOLTIP}
            >
                any outpost
            </span>{' '}
            with the{' '}
            <span
                data-tooltip-id={tooltipId || NO_TOOLTIP}
                data-tooltip-content="Change outpost occupations on the 'Level Up' tab"
                data-tooltip-place="top-start"
                className={tooltipId ? 'text-with-tt' : NO_TOOLTIP}
            >
                {type} occupation
            </span>
        </span>
    );
};
