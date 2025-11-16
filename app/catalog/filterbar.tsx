import { BiQuestionMark } from 'react-icons/bi';
import { BsExclamation, BsHouse } from 'react-icons/bs';
import { FaSeedling } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { GiOre, GiPotionBall } from 'react-icons/gi';
import { useDatabase, type CatalogType, type Category } from '../database/database';
import { useCatalogFilter, type LicenseFilter } from './filtercontext';

export interface CatalogFilterBarProps {}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({}) => {
    const [filter, setFilter] = useCatalogFilter();
    const db = useDatabase();

    // TODO: hover text
    const setCatalog = function (key: CatalogType) {
        if (filter.catalogView == key) {
            setFilter({ ...filter, catalogView: undefined });
        } else {
            setFilter({ ...filter, catalogView: key });
        }
    };

    const setLicenseFilter = function (lf: LicenseFilter) {
        setFilter({ ...filter, licenseFilter: lf });
    };

    // TODO: find better icons once react-icons is back online
    // TODO: update allowed categories dynamically based on actual items in the category
    let allowedCategories: Set<Category> | undefined = new Set(['Material', 'Gear', 'Consumables']);
    if (filter.catalogView) {
        // Quest items can't be filtered
        if (filter.catalogView == 'catalogSpec') {
            allowedCategories = undefined;
        }
        // non-autolog catalogs also include decor
        else if (filter.catalogView != 'catalog') {
            allowedCategories.add('Decor');
        }
    }
    return (
        <div className="catalog-filter">
            Catalog Type:
            <div className="catalog-type-selection">
                {Object.keys(db.catalogs).map((rawKey) => {
                    // guaranteed OK given the type of db.catalogs
                    const key: CatalogType = rawKey as CatalogType;
                    return (
                        <img
                            src={db.catalogs[key].icon}
                            className={'catalog-icon' + selectedClass(filter.catalogView === key)}
                            onClick={() => setCatalog(key)}
                        />
                    );
                })}
            </div>
            {allowedCategories && (
                <div className="item-type-selection">
                    <br />
                    Item categories:
                    <div className="item-category-selection">
                        {allowedCategories.has('Material') && <CategorySelectionIcon category="Material" />}
                        {allowedCategories.has('Consumables') && <CategorySelectionIcon category="Consumables" />}
                        {allowedCategories.has('Gear') && <CategorySelectionIcon category="Gear" />}
                        {allowedCategories.has('Decor') && <CategorySelectionIcon category="Decor" />}
                    </div>
                </div>
            )}
            <div className="collection-selection">
                <br />
                <div>
                    <input
                        type="radio"
                        name="collection-select"
                        id="all"
                        onSelect={() => setLicenseFilter('none')}
                        onClick={() => setLicenseFilter('none')}
                        checked={!filter.licenseFilter || filter.licenseFilter == 'none'}
                    />
                    <label htmlFor="all"> All items</label>
                </div>
                <div>
                    <input
                        type="radio"
                        name="collection-select"
                        id="licensable"
                        onSelect={() => setLicenseFilter('licensable')}
                        onClick={() => setLicenseFilter('licensable')}
                        checked={filter.licenseFilter == 'licensable'}
                    />
                    <label htmlFor="licensable"> Licensable only</label>
                </div>
                <div>
                    <input
                        type="radio"
                        name="collection-select"
                        id="unlicensed"
                        onSelect={() => setLicenseFilter('unlicensed')}
                        onClick={() => setLicenseFilter('unlicensed')}
                        checked={filter.licenseFilter == 'unlicensed'}
                    />
                    <label htmlFor="unlicensed"> Unlicensed only</label>
                </div>
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
            IconType = GiPotionBall;
            break;
        case 'Decor':
            IconType = BsHouse;
            break;
        case 'Gear':
            IconType = FaShield;
            break;
        case 'Material':
            IconType = GiOre;
            break;
        case 'Plant':
            IconType = FaSeedling;
            break;
        case 'Quest':
            IconType = BsExclamation;
            break;
    }

    // TODO: hover text
    return (
        <IconType
            className={'category-selection' + selectedClass(filter.hiddenCategories?.has(category))}
            onClick={() => toggleCategory(category)}
        />
    );
};
