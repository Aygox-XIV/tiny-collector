import { TbInfoSquareRounded } from 'react-icons/tb';
import { NavLink } from 'react-router';
import { Tooltip } from 'react-tooltip';
import { EventIcon } from '../common/eventicon';
import { FragmentIcon } from '../common/fragmenticon';
import { KindIcon } from '../common/kindicon';
import { SourceTypeIcon } from '../common/sourceicon';
import { getSimpleSourceName, SourceName } from '../common/sourcename';
import { sourceId } from '../database/database';
import { getEventType, sourceSortFn, type Source } from '../database/sources';

export interface SourceListProps {
    sources: Source[];
}

interface SourceMap extends Record<string, Source[]> {}
export const SOURCE_TOOLTIP = 'source-tt';

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
    const sortedSources = sources.sort((a, b) => sourceSortFn(a, b));
    return (
        <div className="single-source-list">
            <div className="source-type">
                <SourceTypeIcon type={sources[0].type} />
                {sources[0].type}
            </div>
            <div className="individual-sources">
                {sortedSources.map((s) => {
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
    // TODO: show event phase number
    return (
        <div className={'single-source ' + source.type}>
            <EventIcon showEventPhase={false} type={getEventType(source)} tooltipId={SOURCE_TOOLTIP} />
            <KindIcon kind={source.kind} tooltipId={SOURCE_TOOLTIP} />
            <FragmentIcon fragment={source.fragment} tooltipId={SOURCE_TOOLTIP} />
            <div className="source-name">
                <SourceName source={source} tooltipId={SOURCE_TOOLTIP} />
            </div>
            <NavLink to={'/checklist/' + sourceId(source)}>
                <TbInfoSquareRounded className="source-detail-link-icon" />
            </NavLink>
        </div>
    );
};

export function getSimpleSourceListString(sources: Source[] | undefined): string {
    if (!sources || sources.length == 0) {
        return 'No known sources yet';
    }
    return `Sources: ${sources.map(getSimpleSourceName).join(',\n')}`;
}
