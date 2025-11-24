import { HiPuzzlePiece } from 'react-icons/hi2';
import { LuScrollText } from 'react-icons/lu';
import { TbInfoSquareRounded, TbMoneybag } from 'react-icons/tb';
import { NavLink } from 'react-router';
import { Tooltip } from 'react-tooltip';
import { EventIcon } from '../common/eventicon';
import { SourceTypeIcon } from '../common/sourceicon';
import { SourceName } from '../common/sourcename';
import { sourceId } from '../database/database';
import { getEventCategory, type Source } from '../database/sources';

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
            <EventIcon type={getEventCategory(source)} tooltipId={SOURCE_TOOLTIP} />
            <KindIcon kind={source.kind} />
            <FragmentIcon fragment={source.fragment} />
            <div className="source-name">
                <SourceName source={source} tooltipId={SOURCE_TOOLTIP} />
            </div>
            <NavLink to={'/checklist/' + sourceId(source)}>
                <TbInfoSquareRounded />
            </NavLink>
        </div>
    );
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
