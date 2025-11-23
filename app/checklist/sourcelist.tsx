import type { NoProps } from '../util';
import { useSourceFilter } from './filtercontext';

export const ChecklistSourceList: React.FC<NoProps> = ({}) => {
    const [filter] = useSourceFilter();
    return (
        <div>
            source list.
            {filter.event && <div>Filtered by {filter.event}</div>}
            {filter.hiddenTypes && (
                <div>
                    hiding {filter.hiddenTypes?.size} types: {JSON.stringify(filter.hiddenTypes)}
                </div>
            )}
            {filter.hideCompleted && <div>only showing sources with missing items</div>}
        </div>
    );
};
