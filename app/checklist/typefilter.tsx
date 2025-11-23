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
            {type}
        </div>
    );
};
