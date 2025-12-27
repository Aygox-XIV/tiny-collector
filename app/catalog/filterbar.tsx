import { BiQuestionMark } from 'react-icons/bi';
import { BsExclamationCircle, BsHouse } from 'react-icons/bs';
import { FaSeedling } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { GiCarnivalMask } from 'react-icons/gi';
import { TbFlask2Filled } from 'react-icons/tb';
import { VscRuby } from 'react-icons/vsc';
import { useSearchParams } from 'react-router';
import { Toggle } from '../common/toggle';
import { getImgSrc, useDatabase, type CatalogType, type Category } from '../database/database';
import { useCatalogFilter } from './filtercontext';

export interface CatalogFilterBarProps {}

const ALL_CATEGORIES: Set<Category> = new Set([
    'Material',
    'Gear',
    'Consumables',
    'Decor',
    'Quest',
    'Plant',
    'Cosmetic',
]);

export const CATALOG_PARAM = 'c';

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({}) => {
    const [filter, setFilter] = useCatalogFilter();
    const [searchParams, setSearchParams] = useSearchParams();
    const db = useDatabase();

    const setCatalog = function (key: CatalogType) {
        if (filter.catalogView == key) {
            setFilter({ ...filter, catalogView: undefined });

            setSearchParams({});
        } else {
            setFilter({ ...filter, catalogView: key });
            setSearchParams({ [CATALOG_PARAM]: key });
        }
    };

    // TODO: make the item category selector work like the other tabs.
    let allowedCategories = ALL_CATEGORIES;
    if (filter.catalogView && db.catalogs[filter.catalogView].categories) {
        allowedCategories = new Set(db.catalogs[filter.catalogView].categories);
    }
    // TODO: _only_ items with missing data? include missing-recipe-despite-recipe-source items?
    // TODO: list only items not in any catalog
    return (
        <div className="catalog-filter vert-filter-bar">
            Catalog Type:
            <div className="catalog-type-selection">
                {Object.keys(db.catalogs).map((rawKey) => {
                    // guaranteed OK given the type of db.catalogs
                    const key: CatalogType = rawKey as CatalogType;
                    return (
                        <img
                            key={rawKey}
                            src={getImgSrc(db.catalogs[key].icon)}
                            className={'catalog-icon' + selectedClass(filter.catalogView === key)}
                            onClick={() => setCatalog(key)}
                        />
                    );
                })}
            </div>
            {allowedCategories?.size > 1 && (
                <div className="item-type-selection">
                    <br />
                    Item categories:
                    <div className="item-category-selection">
                        {allowedCategories.has('Material') && <CategorySelectionIcon category="Material" />}
                        {allowedCategories.has('Consumables') && <CategorySelectionIcon category="Consumables" />}
                        {allowedCategories.has('Gear') && <CategorySelectionIcon category="Gear" />}
                        {allowedCategories.has('Decor') && <CategorySelectionIcon category="Decor" />}
                        {allowedCategories.has('Plant') && <CategorySelectionIcon category="Plant" />}
                        {allowedCategories.has('Quest') && <CategorySelectionIcon category="Quest" />}
                        {allowedCategories.has('Cosmetic') && <CategorySelectionIcon category="Cosmetic" />}
                    </div>
                </div>
            )}
            <div className="collection-selection">
                <br />
                <Toggle
                    text="Show unlicensable: "
                    checked={!filter.hideUnlicensable}
                    onClick={() => {
                        setFilter({ ...filter, hideUnlicensable: !filter.hideUnlicensable });
                    }}
                />
                <Toggle
                    text="Show collected: "
                    checked={!filter.hideCollected}
                    onClick={() => {
                        setFilter({ ...filter, hideCollected: !filter.hideCollected });
                    }}
                />
                <Toggle
                    text="Show items with missing data: "
                    checked={!filter.hideUnknown}
                    onClick={(e) => {
                        if (e?.altKey.valueOf()) {
                            setFilter({ ...filter, showOnlyMissingData: !filter.showOnlyMissingData });
                        } else {
                            setFilter({ ...filter, hideUnknown: !filter.hideUnknown });
                        }
                    }}
                />
            </div>
        </div>
    );
};

const selectedClass = function (selected: boolean | undefined) {
    return selected ? ' selected' : ' unselected';
};

interface CatSelectionProps {
    readonly category: Category;
}

const CategorySelectionIcon: React.FC<CatSelectionProps> = ({ category }) => {
    const [filter, setFilter] = useCatalogFilter();
    const toggleCategory = function (clickEvent: React.MouseEvent<SVGElement, MouseEvent>, cat: Category) {
        let cats = filter.hiddenCategories || new Set();
        if (clickEvent.ctrlKey.valueOf()) {
            if (cats.has(cat)) {
                cats.delete(cat);
            } else {
                cats.add(cat);
            }
        } else {
            // TODO: don't have inconsistent behavior when switching between catalogs with different available categories.
            if (cats.size == ALL_CATEGORIES.size - 1 && !cats.has(cat)) {
                cats = new Set();
            } else {
                cats = new Set();
                ALL_CATEGORIES.forEach((c) => cats.add(c));
                cats.delete(cat);
            }
        }
        setFilter({ ...filter, hiddenCategories: cats });
    };
    let IconType = BiQuestionMark;
    switch (category) {
        case 'Consumables':
            IconType = TbFlask2Filled;
            break;
        case 'Decor':
            IconType = BsHouse;
            break;
        case 'Gear':
            IconType = FaShield;
            break;
        case 'Material':
            IconType = VscRuby;
            break;
        case 'Plant':
            IconType = FaSeedling;
            break;
        case 'Quest':
            IconType = BsExclamationCircle;
            break;
        case 'Cosmetic':
            IconType = GiCarnivalMask;
            break;
    }

    // TODO: hover text
    return (
        <IconType
            className={'category-selection' + selectedClass(!filter.hiddenCategories?.has(category))}
            onClick={(e) => toggleCategory(e, category)}
        />
    );
};
