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

    function handleTypeClick(clickEvent: React.MouseEvent<HTMLImageElement, MouseEvent>): void {
        if (clickEvent.ctrlKey.valueOf()) {
            let hiddenTypes = filter.hiddenTypes || new Set();
            if (hiddenTypes.has(type)) {
                hiddenTypes.delete(type);
            } else {
                hiddenTypes.add(type);
            }
            setFilter({ ...filter, hiddenTypes });
        } else {
            let hiddenTypes = filter.hiddenTypes || new Set();
            if (hiddenTypes.size == Object.values(SourceType).length - 1 && !hiddenTypes.has(type)) {
                setFilter({ ...filter, hiddenTypes: new Set() });
            } else {
                hiddenTypes = new Set();
                Object.values(SourceType).forEach((t) => {
                    hiddenTypes.add(t as SourceType);
                });
                hiddenTypes.delete(type);
                setFilter({ ...filter, hiddenTypes });
            }
        }
    }

    return (
        <div className="toggle-row" onClick={handleTypeClick}>
            <SourceTypeIcon
                type={type}
                extraClasses={'toggle-select-icon ' + (filter.hiddenTypes?.has(type) ? 'unselected' : 'selected')}
            />{' '}
            {type}
        </div>
    );
};
