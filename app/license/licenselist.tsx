import { NavLink } from 'react-router';
import { defaultCollectionState, useFullCollection } from '../collection';
import { Icon } from '../common/icon';
import { CatalogType, useDatabase, type Database } from '../database/database';
import { SourceType } from '../database/sources';
import type { NoProps } from '../util';
import { useLicenseFilter } from './filtercontext';

export const LicenseList: React.FC<NoProps> = ({}) => {
    const db = useDatabase();
    const collection = useFullCollection();
    const [filter] = useLicenseFilter();

    let itemsToLicense: string[] = [];
    Object.keys(db.items).forEach((id) => {
        const item = db.items[id];
        // unlicensable
        if (!item || !item.license_amount) {
            return;
        }
        const collectedState = collection.items[id] || defaultCollectionState(id);
        // fully crafted
        if (collectedState.status.licensed || (collectedState.licenseProgress || 0) >= item.license_amount) {
            return;
        }
        if (filter.hideUncollectedItems && !collectedState.status.haveRecipe) {
            return;
        }
        // Even if an item also has a non-premium source (teas, map), still consider it a premium-only item
        // This is arguably not correct for some of the spells since theie non-premium sources are repeatable, but they aren't licensable anyway.
        if (filter.hidePremiumItems) {
            for (const source of item.source || []) {
                if (source.type == SourceType.PremiumPack) {
                    return;
                }
            }
        }

        // Catalog logic is a little bit convoluted, since the main catalog includes all other catalogs (minus quest, which has nothing to license).
        // As such 'full catalog' means 'any item in none of the event catalogs'
        let nonEventItems;
        for (const hiddenCatalog of filter.hiddenCatalogs || []) {
            if (hiddenCatalog == CatalogType.FullCatalog) {
                nonEventItems = nonEventItems || createNonEventItemSet(db);
                if (nonEventItems.has(id)) {
                    return;
                }
            } else if (db.catalogs[hiddenCatalog].itemSet && db.catalogs[hiddenCatalog].itemSet[id]) {
                return;
            }
        }

        itemsToLicense.push(id);
    });

    let materialsToLicense: Record<string, number> = {};
    itemsToLicense.forEach((i) => {
        const item = db.items[i];
        const remainingToLicense = item.license_amount!! - (collection.items[i]?.licenseProgress || 0);
        // no recipe, but licensable: just add the item directly
        if (!item.recipe) {
            materialsToLicense[i] = (materialsToLicense[i] || 0) + remainingToLicense;
        } else {
            const craftsNeeded = Math.ceil(remainingToLicense / item.recipe!.craft_amount);
            // TODO: take into consideration alt recipes, if they are collected
            for (const ingredient of item.recipe.ingredient) {
                materialsToLicense[ingredient.id] =
                    (materialsToLicense[ingredient.id] || 0) + craftsNeeded * ingredient.quantity;
            }
        }
    });

    // TODO: more details in item list:
    // - show & edit license progress, mark-as-licensed
    // - allow marking items as "ignored"? Or have a separate "no collected recipe" list when that option is unchecked & allow marking recipe collection as well
    // optimistic TODO: fully-customizable list with manual item selection.
    // TODO: allow marking craftable materials as "keep crafting" and do another pass over the materials list

    // TODO: tiny scrollable item icons in materials list for which items they're for w/ counts & even tinier license progress bar? lots of empty space otherwise.
    // TODO: sort by required quantity?

    return (
        <div className="license-list">
            <div className="license-material-list-container center-content">
                Required materials:
                <div className="license-materials-list">
                    {Object.keys(materialsToLicense).map((i) => {
                        return <LicenseListEntry id={i} amount={materialsToLicense[i]} key={i} />;
                    })}
                </div>
            </div>
            <div className="license-item-list">
                Items to license:
                {itemsToLicense.map((i) => {
                    return <div key={i}>{db.items[i].name}</div>;
                })}
            </div>
        </div>
    );
};

function createNonEventItemSet(db: Database): Set<string> {
    let nonEventItems: Set<string> = new Set(Object.keys(db.items));
    for (const catalog of Object.values(CatalogType)) {
        if (catalog == CatalogType.FullCatalog || catalog == CatalogType.QuestCatalog) {
            continue;
        }
        Object.keys(db.catalogs[catalog].itemSet || {}).forEach((i) => {
            nonEventItems.delete(i);
        });
    }
    return nonEventItems;
}

interface LicenseItemProps {
    readonly id: string;
    readonly amount: number;
}

const LicenseListEntry: React.FC<LicenseItemProps> = ({ id, amount }) => {
    const item = useDatabase().items[id];
    if (!item) {
        return;
    }
    return (
        <NavLink to={'/catalog/' + item.id}>
            <div className="license-list-entry">
                <div className="license-list-material-icon">
                    <Icon src={item.image} />
                </div>
                <div className="license-list-details">
                    <div className="item-amount">Need: {amount}</div>
                    <div className="item-name">{item.name}</div>
                </div>
            </div>
        </NavLink>
    );
};
