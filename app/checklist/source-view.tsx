import { BsQuestionSquare } from 'react-icons/bs';
import { NavLink } from 'react-router';
import { Tooltip } from 'react-tooltip';
import { changeStatus, useCollectedItem } from '../collection';
import { FragmentIcon } from '../common/fragmenticon';
import { Icon } from '../common/icon';
import { ItemName } from '../common/itemname';
import { KindIcon } from '../common/kindicon';
import { SourceTypeIcon } from '../common/sourceicon';
import { CollectableStatusIcon, LicenseStatusIcon, RecipeStatusIcon } from '../common/statusicons';
import {
    dropIsCollected,
    getImgSrc,
    isCollectable,
    useDatabase,
    type DropDetail,
    type ImageRef,
    type Item,
    type SourceDetails,
} from '../database/database';
import { getEventType, SourceType, type Source } from '../database/sources';
import { useAppDispatch } from '../store';
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
                All items obtainable this way:
                {details.drops.map((d) => {
                    return <DropDetailItem key={i++} drop={d} />;
                })}
            </div>
        </div>
    );
};

interface DropDetailProps {
    readonly drop: DropDetail;
}

const DROP_TOOLTIP = 'drop-tooltip';

const DropDetailItem: React.FC<DropDetailProps> = ({ drop }) => {
    const db = useDatabase();
    const collectedState = useCollectedItem(drop.itemId);
    const dispatch = useAppDispatch();
    const status = collectedState.status;

    function toggleRecipe() {
        dispatch(changeStatus({ id: drop.itemId, status: { ...status, haveRecipe: !status.haveRecipe } }));
    }
    function toggleLicense() {
        dispatch(changeStatus({ id: drop.itemId, status: { ...status, licensed: !status.licensed } }));
    }
    function toggleCollected() {
        dispatch(changeStatus({ id: drop.itemId, status: { ...status, collected: !status.collected } }));
    }

    const item = db.items[drop.itemId];
    const collected = dropIsCollected(drop, collectedState);
    const collectionClass = collected ? 'collected' : 'uncollected';
    return (
        <div className={'droplist-item ' + collectionClass}>
            <Tooltip id={DROP_TOOLTIP} />
            <KindIcon kind={drop.kind} tooltipId={DROP_TOOLTIP} />
            <FragmentIcon fragment={drop.fragment} tooltipId={DROP_TOOLTIP} />
            <NavLink className="droplist-item-icon" to={'/catalog/' + drop.itemId}>
                <Icon src={item.image} />
            </NavLink>
            <NavLink to={'/catalog/' + drop.itemId}>
                <ItemName item={item} />
            </NavLink>
            <div />
            {drop.kind == 'recipe' && item.recipe && (
                <RecipeStatusIcon
                    selected={collectedState.status.haveRecipe}
                    onClick={toggleRecipe}
                    tooltipId={DROP_TOOLTIP}
                />
            )}
            {drop.kind == 'item' && item.license_amount && (
                <LicenseStatusIcon
                    selected={collectedState.status.licensed}
                    onClick={toggleLicense}
                    tooltipId={DROP_TOOLTIP}
                />
            )}
            {isCollectable(item) && (
                <CollectableStatusIcon
                    selected={collectedState.status.collected}
                    onClick={toggleCollected}
                    tooltipId={DROP_TOOLTIP}
                />
            )}
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
            if (source.subtype == 'Anniversary') {
                return <div>Obtain from the Anniversary boutique</div>;
            } else {
                return <div>Buy from the Boutique (Premium menu, Boutique tab)</div>;
            }
        case SourceType.City:
            return (
                <div>
                    {source.subtype} at {source.name} in the City
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Combine:
            return (
                <div>
                    Additional reward when combining the fragments for{' '}
                    <NavLink to={'/catalog/' + source.id} className="text-with-link">
                        {source.name}
                    </NavLink>
                    <div>
                        <NavLink to={'/catalog/' + source.id}>
                            <DetailImage src={db.items[source.id].image} />
                        </NavLink>
                    </div>
                </div>
            );
        case SourceType.EventMarket:
            if (source.name) {
                return (
                    <div>
                        Exchange for the "{source.name}" in the {source.subtype} event market.
                        <DetailImage src={details.imageSrc} />
                    </div>
                );
            }
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
        case SourceType.Harvest: {
            let seedItem: Item | undefined;
            for (const item of Object.values(db.items)) {
                if (item.category == 'Plant' && item.name == source.name) {
                    seedItem = item;
                    break;
                }
            }
            return (
                <div>
                    Harvest {source.name} plants.
                    {seedItem && (
                        <NavLink to={'/catalog/' + seedItem.id}>
                            <DetailImage src={seedItem.image} />
                        </NavLink>
                    )}
                    {!seedItem && <DetailImage />}
                </div>
            );
        }
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
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        case SourceType.Shifty:
            if (source.name) {
                return (
                    <div>
                        Exchange for the "{source.name}" at Shifty's Bazaar
                        <DetailImage src={details.imageSrc} />
                    </div>
                );
            } else {
                return (
                    <div>
                        Exchange directly at Shifty's Bazaar
                        <DetailImage src={details.imageSrc} />
                    </div>
                );
            }
        case SourceType.ShopLevel:
            return <div>Rewards for reaching Shop Level {source.name}</div>;
        case SourceType.Task:
            switch (source.subtype) {
                case 'Outpost':
                    return (
                        <div>
                            Complete tasks from any outpost with a {source.name} occupation.{' '}
                            <DetailImage src={details.imageSrc} />
                        </div>
                    );
                case 'Daily':
                    return <div>Complete daily tasks.</div>;
                default:
                    return (
                        <div>
                            <EventSubtypeDetails source={source} />
                            Complete the task "{source.name}"
                        </div>
                    );
            }
        case SourceType.TaskChest:
            if (source.subtype == 'Daily') {
                return <div>Reward from daily task chests</div>;
            }
            return (
                <div>
                    <EventSubtypeDetails source={source} />
                    Reward from {source.name}
                    <DetailImage src={details.imageSrc} />
                </div>
            );
        default:
            return <div>Unknown source type: {details.source.type}</div>;
    }
};

const EventSubtypeDetails: React.FC<SourceProps> = ({ source }) => {
    if (source.subtype == 'Mission') {
        return <div>Only available during the "{source.mission_name}" mission.</div>;
    } else if (getEventType(source)) {
        // TODO: tooltip, some highlighting?
        return <div>Only availble during the {source.subtype} event</div>;
    } else {
        return <div className="invis" />;
    }
};

interface ImageProps {
    readonly src?: ImageRef;
}

const DetailImage: React.FC<ImageProps> = ({ src }) => {
    if (src) {
        return (
            <div className="detail-image">
                <img src={getImgSrc(src)} className="actual-detail-image" />
            </div>
        );
    } else {
        return <BsQuestionSquare className="detail-image" />;
    }
};
