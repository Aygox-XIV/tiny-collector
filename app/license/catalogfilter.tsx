import { Toggle } from '../common/toggle';
import { CatalogType } from '../database/database';
import type { NoProps } from '../util';
import { useLicenseFilter } from './filtercontext';

export const LicenseCalatogFilterBar: React.FC<NoProps> = ({}) => {
    const [filter, setFilter] = useLicenseFilter();

    // (class names use the 'event' filter for convenience even though this selects catalogs)
    return (
        <div className="catalog-filter vert-filter-bar">
            Catalog Type:
            <div className="event-selection">
                {Object.values(CatalogType).map((c) => {
                    if (c == CatalogType.QuestCatalog) {
                        return;
                    }
                    return <CatalogSelector key={c} catalog={c as CatalogType} />;
                })}
            </div>
            <br />
            <Toggle
                text="Include uncollected recipes"
                checked={!filter.hideUncollectedItems}
                onClick={() => {
                    setFilter({ ...filter, hideUncollectedItems: !filter.hideUncollectedItems });
                }}
            />
            <Toggle
                text="Include premium items"
                checked={!filter.hidePremiumItems}
                onClick={() => {
                    setFilter({ ...filter, hidePremiumItems: !filter.hidePremiumItems });
                }}
            />
            <br />
            Click to select, click again to select all. Hold Ctrl to add to or remove from the selection.
        </div>
    );
};

interface CatalogProps {
    readonly catalog: CatalogType;
}

const CatalogSelector: React.FC<CatalogProps> = ({ catalog }) => {
    const [filter, setFilter] = useLicenseFilter();
    const selectionClass = filter.hiddenCatalogs?.has(catalog) ? 'unselected' : 'selected';
    let iconPath = '/autolog.png';
    switch (catalog) {
        case CatalogType.FullCatalog:
            iconPath = '/autolog.png';
            break;
        case CatalogType.EvercoldCatalog:
            iconPath = '/catalog_evercold.png';
            break;
        case CatalogType.FloodedCatalog:
            iconPath = '/catalog_fe.png';
            break;
        case CatalogType.PhantomCatalog:
            iconPath = '/catalog_phantom.png';
            break;
        case CatalogType.SunCatalog:
            iconPath = '/catalog_sf.png';
            break;
    }
    function handleEventClick(clickEvent: React.MouseEvent<HTMLImageElement, MouseEvent>): void {
        if (clickEvent.ctrlKey.valueOf()) {
            let hiddenCatalogs = filter.hiddenCatalogs || new Set();
            if (hiddenCatalogs.has(catalog)) {
                hiddenCatalogs.delete(catalog);
            } else {
                hiddenCatalogs.add(catalog);
            }
            setFilter({ ...filter, hiddenCatalogs: hiddenCatalogs });
        } else {
            let hiddenCatalogs = filter.hiddenCatalogs || new Set();
            if (hiddenCatalogs.size == Object.values(CatalogType).length - 2 && !hiddenCatalogs.has(catalog)) {
                setFilter({ ...filter, hiddenCatalogs: new Set() });
            } else {
                hiddenCatalogs = new Set();
                Object.values(CatalogType).forEach((e) => {
                    if (e != CatalogType.QuestCatalog) {
                        hiddenCatalogs.add(e as CatalogType);
                    }
                });
                hiddenCatalogs.delete(catalog);
                setFilter({ ...filter, hiddenCatalogs: hiddenCatalogs });
            }
        }
    }

    return <img src={iconPath} className={'event-selector ' + selectionClass} onClick={handleEventClick} />;
};
