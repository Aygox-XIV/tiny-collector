import { NavLink } from 'react-router';
import { useFullCollection, type Collection } from '../collection';
import { EventIcon } from '../common/eventicon';
import { SourceTypeIcon } from '../common/sourceicon';
import { SourceName } from '../common/sourcename';
import { sourceId, useDatabase, type DropDetail, type SourceDetails } from '../database/database';
import { getEventCategory, SourceType } from '../database/sources';
import type { NoProps } from '../util';
import { useSourceFilter } from './filtercontext';

export const ChecklistSourceList: React.FC<NoProps> = ({}) => {
    const [filter] = useSourceFilter();
    const db = useDatabase();
    const collection = useFullCollection();

    const shouldDisplay = function (source: SourceDetails) {
        if (filter.hiddenEvents?.has(getEventCategory(source.source))) {
            return false;
        }
        if (filter.hiddenTypes && filter.hiddenTypes.has(source.source.type)) {
            return false;
        }
        if (filter.hideCompleted) {
            let anyUncollected = false;
            for (const drop of source.drops) {
                if (!dropIsCollected(drop, collection)) {
                    anyUncollected = true;
                    break;
                }
            }
            if (!anyUncollected) {
                return false;
            }
        }
        return true;
    };

    let toDisplay: Record<string | SourceType, SourceDetails[]> = {};
    for (const source of Object.values(db.sources)) {
        if (!shouldDisplay(source)) {
            continue;
        }
        if (!toDisplay[source.source.type]) {
            toDisplay[source.source.type] = [];
        }
        toDisplay[source.source.type].push(source);
    }

    return (
        <div className="checklist-content center-content">
            {Object.keys(toDisplay).map((t) => {
                const type = t as SourceType;
                return <ChecklistSourceTypeEntry key={t} type={type} sources={toDisplay[t]} />;
            })}
        </div>
    );
};

interface SourceTypeEntryProps {
    readonly type: SourceType;
    readonly sources: SourceDetails[];
}

const ChecklistSourceTypeEntry: React.FC<SourceTypeEntryProps> = ({ type, sources }) => {
    return (
        <div className="checklist-type-container">
            <div className="type-label">
                <SourceTypeIcon type={type} /> {type}
            </div>
            <div className="checklist-type-contents">
                {sources.map((s) => {
                    return <ChecklistSourceEntry key={sourceId(s.source)} details={s} />;
                })}
            </div>
        </div>
    );
};

interface SourceDetailsProps {
    readonly details: SourceDetails;
}

const ChecklistSourceEntry: React.FC<SourceDetailsProps> = ({ details }) => {
    const collection = useFullCollection();
    let collectedDrops = 0;
    for (const drop of details.drops) {
        if (dropIsCollected(drop, collection)) {
            collectedDrops++;
        }
    }
    const detailLink = '/checklist/' + sourceId(details.source);
    return (
        <NavLink to={detailLink}>
            {({ isActive }) => (
                <div className={'checklist-source-entry' + (isActive ? ' active' : '')}>
                    <EventIcon type={getEventCategory(details.source)} tooltipId="no-tooltip" />
                    <SourceName source={details.source} disableLinks={true} />
                    <div className="drop-detail">
                        {collectedDrops} / {details.drops.length}
                    </div>
                </div>
            )}
        </NavLink>
    );
};

function dropIsCollected(drop: DropDetail, collection: Collection) {
    const collected = collection.items[drop.itemId];
    if (collected) {
        switch (drop.kind) {
            case 'item':
                // Item drops are only 'done' when the item is licensed or present in the autolog.
                // TODO: consider checking license progress instead of the licensed mark
                return collected.status.licensed || collected.status.collected;
            case 'recipe':
                // Recipe drops are only 'done' once the recipe is available.
                // I don't want to track collected fragment counts; having all fragments is considered equivalent to having the combined recipe.
                return collected.status.haveRecipe;
        }
    }
}
