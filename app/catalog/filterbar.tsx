import { BiQuestionMark } from 'react-icons/bi';
import { BsExclamationCircle, BsHouse } from 'react-icons/bs';
import { FaSeedling } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { TbFlask2Filled } from 'react-icons/tb';
import { VscRuby } from 'react-icons/vsc';
import { Toggle } from '../common/toggle';
import { useDatabase, type CatalogType, type Category } from '../database/database';
import { useCatalogFilter } from './filtercontext';

export interface CatalogFilterBarProps {}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({}) => {
    const [filter, setFilter] = useCatalogFilter();
    const db = useDatabase();

    const setCatalog = function (key: CatalogType) {
        if (filter.catalogView == key) {
            setFilter({ ...filter, catalogView: undefined });
        } else {
            setFilter({ ...filter, catalogView: key });
        }
    };

    // TODO: update allowed categories dynamically based on actual items in the category
    // (or just have the data processor do that?)
    let allowedCategories: Set<Category> = new Set(['Material', 'Gear', 'Consumables', 'Decor', 'Quest', 'Plant']);
    if (filter.catalogView && db.catalogs[filter.catalogView].categories) {
        allowedCategories = new Set(db.catalogs[filter.catalogView].categories);
    }
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
                            src={db.catalogs[key].icon}
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
                    onClick={() => {
                        setFilter({ ...filter, hideUnknown: !filter.hideUnknown });
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
    const toggleCategory = function (cat: Category) {
        let cats = filter.hiddenCategories || new Set();
        if (cats.has(cat)) {
            cats.delete(cat);
        } else {
            cats.add(cat);
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
    }

    // TODO: hover text
    return (
        <IconType
            className={'category-selection' + selectedClass(!filter.hiddenCategories?.has(category))}
            onClick={() => toggleCategory(category)}
        />
    );
};
