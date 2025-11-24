import { BsQuestionSquare } from 'react-icons/bs';
import { NavLink } from 'react-router';
import { WIKI_IMAGE_PATH_PREFIX } from '../common/icon';
import { SourceTypeIcon } from '../common/sourceicon';
import { useDatabase, type SourceDetails } from '../database/database';
import { EventType, SourceType, type Source } from '../database/sources';
import type { Route } from './+types/source-view';

export default function SourceDetailView({ params, matches }: Route.ComponentProps) {
    const db = useDatabase();
    // boring input validation
    const sourceExists = !!db.sources[params.sid];
    return sourceExists ? <SourceDetailPanel details={db.sources[params.sid]} /> : <div className="invis" />;
}

interface SourceDetailsProps {
    readonly details: SourceDetails;
}

const SourceDetailPanel: React.FC<SourceDetailsProps> = ({ details }) => {
    const db = useDatabase();
    let i = 0;
    return (
        <div className="source-details-panel">
            <div className="source-details-type">
                <SourceTypeIcon type={details.source.type} />
                {details.source.type}
            </div>
            <div className="source-details-specifics">
                <SpecificDetails details={details} />
            </div>

            <div className="source-details-droplist">
                Drop list:
                {details.drops.map((d) => {
                    return (
                        <div key={i++} className="droplist-item">
                            {db.items[d.itemId].name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface SourceProps {
    readonly source: Source;
}

const SpecificDetails: React.FC<SourceDetailsProps> = ({ details }) => {
    const db = useDatabase();
    const source = details.source;
    switch (source.type) {
        case SourceType.Battle:
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Enemy to defeat: {source.name}
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Boutique:
            return <div>Buy from the Boutique (Premium menu, Boutique tab)</div>;
        case SourceType.City:
            return (
                <div>
                    {source.subtype} at {source.name}
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Combine:
            return (
                <div>
                    Additional reward when combining the fragments for{' '}
                    <NavLink to={'/catalog/' + source.id}>{source.name}</NavLink>
                    <div>
                        <NavLink to={'/catalog/' + source.id}>
                            <DetailImage src={WIKI_IMAGE_PATH_PREFIX + db.items[source.id].wiki_image_path} />
                        </NavLink>
                    </div>
                </div>
            );
        case SourceType.EventMarket:
            return (
                <div>
                    Buy from the {source.subtype} event market.
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Feat:
            return (
                <div>
                    Complete level {source.level} of the Feat "{source.name}" in the {source.subtype} category.
                </div>
            );
        case SourceType.Harvest:
            return (
                <div>
                    Harvest {source.name} plants.
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Journey:
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Comple the {source.name} journey.
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Market:
            return <div>Buy from the Materials tab in the standard Market</div>;
        case SourceType.MissionReward:
            return <div>Complete the mission "{source.name}"</div>;
        case SourceType.Outpost:
            return (
                <div>
                    {source.subtype} at any outpost with the {source.name} occupation.
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.PremiumPack:
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Buy the "{source.name}" premium pack.
                </div>
            );
        case SourceType.Shifty:
            if (source.name) {
                return <div>Exchange for the "{source.name}" at Shifty's Bazaar</div>;
            } else {
                return <div>Exchange directly at Shifty's Bazaar</div>;
            }
        case SourceType.ShopLevel:
            return <div>Rewards for reaching Shop Level {source.name}</div>;
        case SourceType.Task:
            if (
                source.name === 'Archeology' ||
                source.name === 'Naturalist' ||
                source.name === 'Coastal' ||
                source.name === 'Trader'
            ) {
                return <div>Complete tasks from any outpost with a {source.name} occupation</div>;
            }
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Complete the task "{source.name}"
                </div>
            );
        case SourceType.TaskChest:
            if (source.subtype == 'Daily') {
                return <div>Reward from daily task chests</div>;
            }
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Reward from {source.name}
                </div>
            );
        default:
            return <div>Unknown source type: {details.source.type}</div>;
    }
};

const EventSubtypeDetails: React.FC<SourceProps> = ({ source }) => {
    if (source.subtype as EventType) {
        // TODO: tooltip, some highlighting?
        return <div>Only availble during the {source.subtype} event</div>;
    } else {
        return <div className="invis" />;
    }
};

interface ImageProps {
    readonly src?: string;
}

const DetailImage: React.FC<ImageProps> = ({ src }) => {
    if (src) {
        return <img src={src} className="detail-image" />;
    } else {
        return <BsQuestionSquare className="detail-image" />;
    }
};
