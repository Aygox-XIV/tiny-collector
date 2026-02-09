import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { TbChefHat, TbChefHatOff, TbLicense, TbLicenseOff } from 'react-icons/tb';
import { Icon } from '../common/icon';
import { CatalogType, useDatabase } from '../database/database';
import type { Route } from './+types/view';

export default function HelpView({ params, matches }: Route.ComponentProps) {
    const db = useDatabase();
    return (
        <div className="help-view center-content">
            <div className="section-desc">
                <h3>Catalog</h3>
                <span>
                    Shows all items available in the game, and lets you mark off collection status by clicking the
                    relevant icons on each item:
                    <div className="icon-desc">
                        <TbChefHat />
                        <TbChefHatOff /> - Recipe collected / uncollected
                    </div>
                    <div className="icon-desc">
                        <TbLicense />
                        <TbLicenseOff /> - Licensed / unlicensed
                    </div>
                    <div className="icon-desc">
                        <HiOutlineCheck />
                        <HiOutlineX /> - Collected / uncollected (for items that cannot be licensed AND have no recipe)
                    </div>
                    You can manually set your license progress for each item as well, which will affect the License
                    Calculator.
                    <br />
                    <br />
                    The background of the item in the center view will change color depending on its status:
                    <ul>
                        <li>
                            Striped green: the item has a recipe and can be licensed, and you have marked only one of
                            them as complete/collected.
                        </li>
                        <li>
                            Green: you have marked all of the above collection statuses (you have the recipe if it has
                            one, have licensed it if it is licensable, or have marked it as collected if it is neither)
                        </li>
                        <li>
                            Red: there is no documented source for this item, or there is a known recipe source but no
                            documented recipe. (please report it in the Discord's #wiki-project channel if you found
                            where it's from or have the recipe!)
                        </li>
                    </ul>
                    The border may be dashed red if it's not 100% certain where in the catalog the item is placed, for
                    situations where the recipe fragment drops are rare and the silhouettes are too similar.
                </span>
                <span>
                    Use the menu on the left and the search box to change which items are displayed:
                    <div className="sub-desc">
                        Click a Catalog Type icon to change which set of items is being displayed:
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.FullCatalog].icon} /> shows the items in, and in the same
                            order as, the Catalog in the game.
                        </div>
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.QuestCatalog].icon} /> shows the items in, and in the
                            same order as, the (!) section of the Catalog in the game.
                        </div>
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.SunCatalog].icon} /> shows the items in, and in the same
                            order as, the Sun Festival's Catalog ([i] on the event tasks page) in the game.
                        </div>
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.FloodedCatalog].icon} /> shows the items in, and in the
                            same order as, the Flooded Expedition's Catalog ([i] on the event tasks page) in the game.
                            After the catalog-included items are the items that are obtainable through battles (which
                            aren't included in the in-game event catalog even though they are event-specific)
                        </div>
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.PhantomCatalog].icon} /> shows the subset of items from
                            the main Catalog that are only available during the Phantom Isle (Halloween) yearly event.
                            The items are sorted and placed based on their location in the main catalog.
                        </div>
                        <div className="event-desc">
                            <Icon src={db.catalogs[CatalogType.EvercoldCatalog].icon} /> shows the subset of items from
                            the main Catalog that are only available during the Evercold Isle ('Winter') yearly event.
                            The items are sorted and placed based on their location in the main catalog.
                        </div>
                    </div>
                    <div className="sub-desc">
                        Click an item category icon to only see items of that category. Hold Ctrl while clicking to add
                        or remove categories to the selection. If only one category is selected, click it again to show
                        all categories again.
                    </div>
                    <div className="sub-desc">
                        To find only the items that feed into the License Calculator, hide unlicensable items.
                        <br />
                        If you hide "collected" items, items where all displayed collection items (see above) are marked
                        will be hidden.
                        <br />
                        This site will have some placeholder entries for items where the community has not yet found all
                        data about it. Hide items with missing data if you do not want to have these cluttering your
                        view. (hold Alt while clicking his option to toggle <i>only</i> seeing items with missing data,
                        including items with missing icons)
                    </div>
                </span>
            </div>
            <div className="section-desc">
                <h3>License Calculator</h3>
                <p>
                    Lists all items required to license all remaining unlicensed (as per the Catalog view) items. If an
                    item has a recipe, enough ingredients to craft exactly the license amount are listed.
                </p>
                <p>
                    The Catalog Type icons allow filtering between "main game" and event-specific items. Hold Ctrl while
                    clicking to add or remove events to the selection. If only one event is selected, click it again to
                    show all events again.
                </p>
                <p>
                    You can exclude items you do not have the recipe for (as per the Catalog view), as well as items
                    that can only be obtained through real-money packs.
                </p>
            </div>
            <div className="section-desc">
                <h3>Checklist</h3>
                <p>
                    A view of the Catalog that groups by how and where items are obtained. If something drops (a
                    fragment of) an individual item, you can mark the item as licensed (or "collected" if it cannot be
                    licensed) from here. If it drops (a fragment of) a recipe, you can mark the recipe collection
                    status.
                </p>
                <p>
                    The Catalog Type icons allow filtering between "main game" and event-specific items. Hold Ctrl while
                    clicking to add or remove events to the selection. If only one event is selected, click it again to
                    show all events again.
                </p>
                <p>
                    The Categories list allow filtering between different ways of obtaining items and recipes. Hold Ctrl
                    while clicking to add or remove categories to the selection. If only one category is selected, click
                    it again to show all categories again.
                </p>
                <p>
                    An individual source of items is considered "complete" once all of its possible drops have been
                    collected, and the source will be greyed out in the list. You can choose to hide the sources that
                    are complete.
                </p>
                <p>
                    Clicking the [i] next to a drop entry will open the Catalog view for the dropped item or recipe. For
                    some source types, such as "Harvest" or "Combine", clicking the image will go to the Catalog view
                    relevant for the source (e.g. the garden seeds)
                </p>
            </div>
            <div className="section-desc">
                <h3>Data management</h3>
                <p>Provides backup, restore and reset options of your collection state.</p>
                <p>
                    The "database management" options linked at the bottom are mostly for me (Aygox) for now, to reduce
                    some required manual edits to the data files while I figure out how to best support
                    community-provided fixes & additions. (for now, just report issues in the #wiki-project channel in
                    the discord, a DM to me, or as an Issue on the GitHub page)
                </p>
            </div>
        </div>
    );
}
