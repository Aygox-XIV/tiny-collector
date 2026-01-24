import type { Item } from './database';

export type DropKind = 'item' | 'recipe' | 'unlock';

interface UnknownSource {
    readonly kind: DropKind;
    readonly fragment: boolean;
    readonly type: SourceType;
    readonly subtype?: string;
    readonly name?: string;
    // skip cost data. is RNG for some cases so can't feed into the calculator.
}

export type Source =
    | OutpostSource
    | CitySource
    | HarvestSource
    | PremiumPackSource
    | BoutiqueSource
    | BattleSource
    | JourneySource
    | ShiftySource
    | EventMarketSource
    | MissionRewardSource
    | MarketSource
    | FeatSource
    | TaskSource
    | TaskChestSource
    | CombineSource
    | ShopLevelSource;

export enum SourceType {
    Outpost = 'Outpost',
    City = 'City',
    Harvest = 'Harvest',
    PremiumPack = 'Premium Pack',
    Boutique = 'Boutique',
    Battle = 'Battle',
    Journey = 'Journey',
    Shifty = 'Shifty',
    EventMarket = 'Event Market',
    MissionReward = 'Mission Reward',
    Market = 'Market', // materials tab only
    Feat = 'Feat',
    Task = 'Task', // individual task rewards
    TaskChest = 'Task Chest',
    Combine = 'Combine', // extra rewards when combining
    ShopLevel = 'Shop Level',
}

export enum EventType {
    SunFestival = 'Sun Festival',
    FloodedExpedition = 'Flooded Expedition',
    PhantomIslePart1 = 'Phantom Isle (part 1)',
    PhantomIslePart2 = 'Phantom Isle (part 2)',
    PhantomIslePart3 = 'Phantom Isle (part 3)',
    EvercoldIslePart1 = 'Evercold Isle (part 1)',
    EvercoldIslePart2 = 'Evercold Isle (part 2)',
}

export enum EventCategory {
    NoEvent = 'No event',
    SunFestival = 'Sun Festival',
    FloodedExpedition = 'Flooded Expedition',
    PhantomIsle = 'Phantom Isle',
    EvercoldIsle = 'Evercold Isle',
}

const eventTypeSet: Set<string> = new Set(Object.values(EventType));

export function getEventType(source: Source): EventType | undefined {
    if (source.subtype && eventTypeSet.has(source.subtype)) {
        return source.subtype as EventType;
    }
}

export function getEventCategory(source: Source): EventCategory {
    switch (source.subtype) {
        case EventType.EvercoldIslePart1:
        case EventType.EvercoldIslePart2:
            return EventCategory.EvercoldIsle;
        case EventType.PhantomIslePart1:
        case EventType.PhantomIslePart2:
        case EventType.PhantomIslePart3:
            return EventCategory.PhantomIsle;
        case EventType.FloodedExpedition:
            return EventCategory.FloodedExpedition;
        case EventType.SunFestival:
            return EventCategory.SunFestival;
        default:
            return EventCategory.NoEvent;
    }
}

export function eventTypeToCategory(type?: EventType): EventCategory {
    switch (type) {
        case EventType.EvercoldIslePart1:
        case EventType.EvercoldIslePart2:
            return EventCategory.EvercoldIsle;
        case EventType.PhantomIslePart1:
        case EventType.PhantomIslePart2:
        case EventType.PhantomIslePart3:
            return EventCategory.PhantomIsle;
        case EventType.FloodedExpedition:
            return EventCategory.FloodedExpedition;
        case EventType.SunFestival:
            return EventCategory.SunFestival;
        default:
            return EventCategory.NoEvent;
    }
}

export function eventCategoryToType(category: EventCategory, phase?: number): EventType {
    switch (category) {
        case EventCategory.NoEvent:
            throw 'NoEvent has no associated event type';
        case EventCategory.EvercoldIsle:
            switch (phase) {
                case 1:
                    return EventType.EvercoldIslePart1;
                case 2:
                    return EventType.EvercoldIslePart2;
            }
            throw 'Unknown evercold event phase ' + phase;
        case EventCategory.PhantomIsle:
            switch (phase) {
                case 1:
                    return EventType.PhantomIslePart1;
                case 2:
                    return EventType.PhantomIslePart2;
                case 3:
                    return EventType.PhantomIslePart3;
            }
            throw 'Unknown phantom  event phase ' + phase;
        case EventCategory.FloodedExpedition:
            if (phase !== undefined) {
                throw 'unknown flooded expedition event phase ' + phase;
            }
            return EventType.FloodedExpedition;
        case EventCategory.SunFestival:
            if (phase !== undefined) {
                throw 'unknown sun festival event phase ' + phase;
            }
            return EventType.SunFestival;
    }
}

export function getEventPhase(type?: EventType): number | undefined {
    switch (type) {
        case EventType.EvercoldIslePart1:
        case EventType.PhantomIslePart1:
            return 1;
        case EventType.EvercoldIslePart2:
        case EventType.PhantomIslePart2:
            return 2;
        case EventType.PhantomIslePart3:
            return 3;
    }
}

export function sourceSortFn(a: Source, b: Source): number {
    const aIsMission = a.subtype == 'Mission';
    const bIsMission = b.subtype == 'Mission';
    if (aIsMission != bIsMission) {
        return aIsMission ? 1 : -1;
    }
    const aEventCat = getEventCategory(a);
    const bEventCat = getEventCategory(b);
    if (aEventCat != bEventCat) {
        if (aEventCat == EventCategory.NoEvent) {
            return -1;
        } else if (bEventCat == EventCategory.NoEvent) {
            return 1;
        } else if (aEventCat < bEventCat) {
            // TODO: sun > flooded > phantom > evercold instead of alphabetical
            return -1;
        } else {
            return 1;
        }
    }
    const aEventPhase = getEventPhase(a.subtype as EventType) || 0;
    const bEventPhase = getEventPhase(b.subtype as EventType) || 0;
    if (aEventPhase !== bEventPhase) {
        if (aEventPhase < bEventPhase) {
            return -1;
        } else {
            return 1;
        }
    }
    if (a.name === b.name) {
        return 0;
    }
    return (a.name || '') < (b.name || '') ? -1 : 1;
}

export enum OutpostType {
    Trading = 'Trading',
    Coastal = 'Coastal',
    Naturalist = 'Naturalist',
    Archeology = 'Archeology',
}

// sample, not sure if needed. type+switch should be enough.
export function isOutpost(s: UnknownSource): s is OutpostSource {
    return s.type == SourceType.Outpost;
}

export interface OutpostSource extends UnknownSource {
    readonly type: SourceType.Outpost;
    readonly subtype: 'Shop' | 'Exchange' | 'Research';
    readonly name: OutpostType;
}

export type CityBuilding =
    | 'Trading Guild'
    | 'Gismoshop'
    | 'Ardent Forge'
    | "Almo's Lab"
    | "Lily's Garden"
    | 'Chic Furnishings'
    | 'Chez Gustave';

export interface CitySource extends UnknownSource {
    readonly type: SourceType.City;
    readonly subtype: 'Shop' | 'Research';
    readonly name: CityBuilding;
}

export type GardenSeed =
    | 'Blue Tower'
    | 'Summer Glory'
    | 'Puff Flower'
    | 'Sunsugar Cane'
    | 'Pumpkin'
    | 'Dwarf Cocoa Seed'
    | 'Carrots'
    | 'Wheat'
    | 'Cinderwheat'
    | 'Everspring'
    | 'Rice'
    | 'Potatoes'
    | 'Croissant Tree'
    | 'Sunseekers'
    | 'Koko Tree'
    | 'Bonefinger'
    | 'Scalebulb'
    | 'Bana Tree'
    | 'Arcane Croissant Tree'
    | 'Coffee'
    | 'Strange Seed'
    | 'Even Stranger Seed'
    | 'Ashen Wheat'
    | 'White Megashroom';

export interface HarvestSource extends UnknownSource {
    readonly type: SourceType.Harvest;
    readonly subtype?: undefined;
    readonly name: GardenSeed;
}

export interface PremiumPackSource extends UnknownSource {
    readonly type: SourceType.PremiumPack;
    readonly subtype?: EventType.SunFestival | undefined;
    readonly name: 'Trading Guild Pack' | 'Kitchen Set' | 'Botanist Set' | 'Home Set' | 'Blacksmith Set' | string;
}

export interface BoutiqueSource extends UnknownSource {
    readonly type: SourceType.Boutique;
    readonly subtype?: 'Anniversary' | undefined;
    readonly name: undefined;
}

export interface BattleSource extends UnknownSource {
    readonly type: SourceType.Battle;
    readonly subtype:
        | EventType.FloodedExpedition
        | EventType.PhantomIslePart2
        | EventType.PhantomIslePart3
        | EventType.EvercoldIslePart2;
    // name is untyped (too many enemies to list usefully)
    readonly name: string;
    // TODO: list journeys enemies can appear in using a separate db?
}

export interface JourneySource extends UnknownSource {
    readonly type: SourceType.Journey;
    readonly subtype?: EventType | 'Mission' | undefined;
    readonly name: string;
    readonly mission_name?: string | undefined;
}

export interface ShiftySource extends UnknownSource {
    readonly type: SourceType.Shifty;
    readonly subtype?: undefined;
    // TODO: name is undefined (direct purchase) | {crate names}
}

export interface EventMarketSource extends UnknownSource {
    readonly type: SourceType.EventMarket;
    readonly subtype: EventType;
    // If present, name is a crate name.
    readonly name?: string | undefined;
}

export interface MissionRewardSource extends UnknownSource {
    readonly type: SourceType.MissionReward;
    readonly subtype?: undefined;
    readonly name: string;
}

export interface MarketSource extends UnknownSource {
    readonly type: SourceType.Market;
    readonly subtype?: undefined;
    readonly name: 'Materials';
}

export interface FeatSource extends UnknownSource {
    readonly type: SourceType.Feat;
    readonly subtype:
        | 'Misc'
        | 'Crafting'
        | 'Selling'
        | 'Buying'
        | 'Trading'
        | 'City'
        | 'Shop'
        | 'Garden'
        | 'Event'
        | 'World'
        | 'Decor';
    readonly name: string;
    readonly level: number;
}

export interface TaskSource extends UnknownSource {
    readonly type: SourceType.Task;
    readonly subtype: 'Daily' | 'Outpost' | EventType;
    readonly name:
        | OutpostType
        // task name, if known
        | string
        | undefined;
}

export interface TaskChestSource extends UnknownSource {
    readonly type: SourceType.TaskChest;
    readonly subtype: 'Daily' | EventType;
}

export interface CombineSource extends UnknownSource {
    readonly type: SourceType.Combine;
    readonly subtype?: undefined;
    readonly name: string;
    readonly id: string;
}

export interface ShopLevelSource extends UnknownSource {
    readonly type: SourceType.ShopLevel;
    readonly subtype?: undefined;
    // level
    readonly name: string;
}

/** Checks if a given source has valid data for the given item. Logs issues to the console. */
export function validateSingleSource(item: Item, source: Source) {
    switch (source.kind as string) {
        case 'item':
        case 'recipe':
        case 'unlock':
            break;
        default:
            console.warn(`Bad kind (${source.kind}) for item ${item.id}`);
    }
    if (source.kind == 'recipe' && !item.recipe) {
        console.warn(`Item ${item.id} (${item.name}) has no recipe, but has a recipe source`);
    }
    if (source.fragment) {
        switch (item.category) {
            case 'Plant':
                console.warn(
                    `Unexpected fragment source for item ${item.id} (${item.name}) with category ${item.category}`,
                );
                break;
        }
    }
    switch (source.type) {
        case SourceType.Battle:
            switch (source.subtype) {
                case EventType.EvercoldIslePart2:
                case EventType.FloodedExpedition:
                case EventType.PhantomIslePart2:
                case EventType.PhantomIslePart3:
                    break;
                default:
                    console.warn(
                        `Bad Battle source for ${item.id}; unexpected subtype ${(source as UnknownSource).subtype}`,
                    );
            }
            break;
        case SourceType.City:
            if (source.subtype == 'Research') {
                if (source.kind != 'recipe') {
                    console.warn(
                        `Bad City source for ${item.id} (${item.name}); unexpected kind ${source.kind} for Research`,
                    );
                }
            }
            break;
        case SourceType.Outpost:
            if (source.subtype == 'Research') {
                if (source.kind != 'recipe' && source.kind != 'unlock') {
                    console.warn(
                        `Bad Outpost source for ${item.id} (${item.name}); unexpected kind ${source.kind} for Research`,
                    );
                }
            }
            break;
        case SourceType.Journey:
            if (source.kind == 'recipe') {
                // the best info we have about some of the bone items is that their recipes drop directly
                if (!source.fragment && ![432, 503, 505, 534].includes(item.id)) {
                    console.warn(
                        `Bad Journey source for ${item.id} (${item.name}); recipes should only drop as fragments`,
                    );
                }
            }
            break;
        case SourceType.TaskChest:
            switch (getEventCategory(source)) {
                case EventCategory.FloodedExpedition:
                case EventCategory.SunFestival:
                    if (source.kind == 'recipe') {
                        if (source.name?.toLowerCase()?.includes('small')) {
                            if (!source.fragment) {
                                console.warn(
                                    `Bad TaskChest source for ${item.id} (${item.name}); weekly small chests only have fragmented recipes`,
                                );
                            }
                        } else {
                            if (source.fragment) {
                                console.warn(
                                    `Bad TaskChest source for ${item.id} (${item.name}); weekly medium & large chests only have complete recipes`,
                                );
                            }
                        }
                    }
                    break;
                case EventCategory.EvercoldIsle:
                case EventCategory.PhantomIsle:
                    if (source.fragment) {
                        console.warn(
                            `Bad TaskChest source for ${item.id} (${item.name}); yearly chests don't drop fragments`,
                        );
                    }
                    break;
            }
            break;
        // TODO: more?
    }
}
