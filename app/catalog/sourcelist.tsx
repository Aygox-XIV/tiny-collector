import { BsCashCoin, BsExclamationCircle, BsQuestionSquareFill, BsSun } from 'react-icons/bs';
import { FaOctopusDeploy, FaRegStar, FaShieldAlt, FaShoppingBasket } from 'react-icons/fa';
import { FaCheck, FaRegSnowflake, FaTreeCity } from 'react-icons/fa6';
import { GiOpenChest, GiPumpkin, GiRaccoonHead } from 'react-icons/gi';
import { HiPuzzlePiece } from 'react-icons/hi2';
import { LiaLevelUpAltSolid } from 'react-icons/lia';
import { LuGem, LuScrollText, LuSword } from 'react-icons/lu';
import { PiPlant, PiWaves } from 'react-icons/pi';
import { TbMoneybag, TbPuzzle2 } from 'react-icons/tb';
import { NavLink } from 'react-router';
import { Tooltip } from 'react-tooltip';
import { EventType, SourceType, type Source } from '../database/sources';

export interface SourceListProps {
    sources: Source[];
}

interface SourceMap extends Record<string, Source[]> {}
const SOURCE_TOOLTIP = 'source-tt';

/** Details panel */
export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    // group by type
    let sourceMap: SourceMap = {};
    sources.forEach((s) => {
        sourceMap[s.type] = sourceMap[s.type] || [];
        sourceMap[s.type].push(s);
    });
    return (
        <div className="source-list">
            {Object.keys(sourceMap).map((t) => {
                return <SingleSourceList sources={sourceMap[t]} key={t} />;
            })}
            <Tooltip id={SOURCE_TOOLTIP} />
        </div>
    );
};

const SingleSourceList: React.FC<SourceListProps> = ({ sources }) => {
    let i = 0;
    return (
        <div className="single-source-list">
            <div className="source-type">
                <SourceTypeIcon type={sources[0].type} />
                {sources[0].type}
            </div>
            <div className="individual-sources">
                {sources.map((s) => {
                    return <SingleSource source={s} key={i++} />;
                })}
            </div>
        </div>
    );
};

interface SingleSourceProps {
    readonly source: Source;
}

const SingleSource: React.FC<SingleSourceProps> = ({ source }) => {
    return (
        <div className={'single-source ' + source.type}>
            <EventIcon type={source.subtype} />
            <KindIcon kind={source.kind} />
            <FragmentIcon fragment={source.fragment} />
            <div className="source-name">
                <SourceName source={source} />
            </div>
        </div>
    );
};

const SourceName: React.FC<SingleSourceProps> = ({ source }) => {
    switch (source.type) {
        case SourceType.Battle:
            return (
                <div data-tooltip-id={SOURCE_TOOLTIP} data-tooltip-content="Enemy name" data-tooltip-place="top-start">
                    {source.name}
                </div>
            );
        case SourceType.Boutique:
            return <div>Buy from the Boutique using Gems</div>;
        case SourceType.City:
            return (
                <div>
                    {source.subtype} at {source.name}
                </div>
            );
        case SourceType.Combine:
            return (
                <div
                    data-tooltip-id={SOURCE_TOOLTIP}
                    data-tooltip-content="Combine fragments for this item"
                    data-tooltip-place="top-start"
                >
                    <NavLink to={'/catalog/' + source.id}>{source.name}</NavLink>
                </div>
            );
        case SourceType.EventMarket:
            return <div>Buy from the {source.subtype} event market.</div>;
        case SourceType.Feat:
            return (
                <div
                    data-tooltip-id={SOURCE_TOOLTIP}
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
                    {source.subtype} at <OutpostDescription type={source.name} />
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
            if (
                source.name === 'Archeology' ||
                source.name === 'Naturalist' ||
                source.name === 'Coastal' ||
                source.name === 'Trader'
            ) {
                return <div>Complete tasks from any outpost with a {source.name} occupation</div>;
            }
            return <div>{source.name}</div>;
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

interface OutpostTypeProp {
    readonly type: string;
}

const OutpostDescription: React.FC<OutpostTypeProp> = ({ type }) => {
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
                data-tooltip-id={SOURCE_TOOLTIP}
                data-tooltip-content={'Outposts that can have this occupation: ' + availableOutposts}
                data-tooltip-place="top-start"
                className="text-with-tt"
            >
                any outpost
            </span>{' '}
            with the{' '}
            <span
                data-tooltip-id={SOURCE_TOOLTIP}
                data-tooltip-content="Change outpost occupations on the 'Level Up' tab"
                data-tooltip-place="top-start"
                className="text-with-tt"
            >
                {type} occupation
            </span>
        </span>
    );
};

interface EventIconProps {
    readonly type?: string;
}

const EventIcon: React.FC<EventIconProps> = ({ type }) => {
    let IconChoice;
    switch (type) {
        case EventType.EvercoldIslePart1:
        case EventType.EvercoldIslePart2:
            IconChoice = FaRegSnowflake;
            break;
        case EventType.PhantomIslePart1:
        case EventType.PhantomIslePart2:
            IconChoice = GiPumpkin;
            break;
        case EventType.FloodedExpedition:
            IconChoice = PiWaves;
            break;
        case EventType.SunFestival:
            IconChoice = BsSun;
            break;
        default:
            return <div className="source-icon" />;
    }
    return <IconChoice className="source-icon" data-tooltip-id={SOURCE_TOOLTIP} data-tooltip-content={type} />;
};

interface KindIconProps {
    readonly kind: 'item' | 'recipe';
}
const KindIcon: React.FC<KindIconProps> = ({ kind }) => {
    let IconChoice;
    switch (kind) {
        case 'item':
            IconChoice = TbMoneybag;
            break;
        case 'recipe':
            IconChoice = LuScrollText;
            break;
    }
    return <IconChoice className="source-icon" data-tooltip-id={SOURCE_TOOLTIP} data-tooltip-content={kind} />;
};

interface FragmentIconProps {
    readonly fragment: boolean;
}

const FragmentIcon: React.FC<FragmentIconProps> = ({ fragment }) => {
    if (fragment) {
        return (
            <HiPuzzlePiece className="source-icon" data-tooltip-id={SOURCE_TOOLTIP} data-tooltip-content="Fragment" />
        );
    } else {
        return <div className="source-icon" />;
    }
};

interface SourceIconProps {
    readonly type: SourceType;
}

const SourceTypeIcon: React.FC<SourceIconProps> = ({ type }) => {
    let IconChoice;
    switch (type) {
        case SourceType.Battle:
            IconChoice = LuSword;
            break;
        case SourceType.Boutique:
            IconChoice = LuGem;
            break;
        case SourceType.City:
            IconChoice = FaTreeCity;
            break;
        case SourceType.Combine:
            IconChoice = TbPuzzle2;
            break;
        case SourceType.EventMarket:
            IconChoice = FaShoppingBasket;
            break;
        case SourceType.Feat:
            IconChoice = FaRegStar;
            break;
        case SourceType.Harvest:
            IconChoice = PiPlant;
            break;
        case SourceType.Journey:
            IconChoice = BsExclamationCircle;
            break;
        case SourceType.Market:
            IconChoice = FaShieldAlt;
            break;
        case SourceType.MissionReward:
            IconChoice = LuScrollText;
            break;
        case SourceType.Outpost:
            IconChoice = FaOctopusDeploy;
            break;
        case SourceType.PremiumPack:
            IconChoice = BsCashCoin;
            break;
        case SourceType.Shifty:
            IconChoice = GiRaccoonHead;
            break;
        case SourceType.ShopLevel:
            IconChoice = LiaLevelUpAltSolid;
            break;
        case SourceType.Task:
            IconChoice = FaCheck;
            break;
        case SourceType.TaskChest:
            IconChoice = GiOpenChest;
            break;
        default:
            IconChoice = BsQuestionSquareFill;
            break;
    }
    return <IconChoice className="source-icon" />;
};
