interface UnknownSource {
    readonly kind: 'item' | 'recipe';
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
    PhantomIslePart3 = 'Phantom Isle (part 2)',
    EvercoldIslePart1 = 'Evercold Isle (part 1)',
    EvercoldIslePart2 = 'Evercold Isle (part 2)',
}

export enum EventCategory {
    NoEvent = '',
    SunFestival = 'Sun Festival',
    FloodedExpedition = 'Flooded Expedition',
    PhantomIsle = 'Phantom Isle',
    EvercoldIsle = 'Evercold Isle',
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

export interface CitySource extends UnknownSource {
    readonly type: SourceType.City;
    readonly subtype: 'Shop' | 'Research';
    readonly name:
        | 'Trading Guild'
        | 'Gismoshop'
        | 'Ardent Forge'
        | "Almo's Lab"
        | "Lily's Garden"
        | 'Chic Furnishings'
        | 'Chez Gustave';
}

export interface HarvestSource extends UnknownSource {
    readonly type: SourceType.Harvest;
    readonly subtype: undefined;
    readonly name:
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
}

export interface PremiumPackSource extends UnknownSource {
    readonly type: SourceType.PremiumPack;
    readonly subtype: EventType.SunFestival | undefined;
    readonly name: 'Trading Guild Pack' | 'Kitchen Set' | 'Botanist Set' | 'Blacksmith Set' | string;
}

export interface BoutiqueSource extends UnknownSource {
    readonly type: SourceType.Boutique;
    readonly subtype: undefined;
    readonly name: undefined;
}

export interface BattleSource extends UnknownSource {
    readonly type: SourceType.Battle;
    readonly subtype:
        | EventType.FloodedExpedition
        | EventType.PhantomIslePart2
        // TODO: I forget if part 1 has battles or not
        | EventType.EvercoldIslePart2;
    // name is untyped (too many enemies to list usefully)
    readonly name: string;
    // TODO: journeys enemies can appear in from separate db?
}

export interface JourneySource extends UnknownSource {
    readonly type: SourceType.Journey;
    readonly subtype: EventType | undefined;
    // name is untyped for now. might list them later.
    readonly name: string;
}

export interface ShiftySource extends UnknownSource {
    readonly type: SourceType.Shifty;
    readonly subtype: undefined;
    // TODO: name is undefined (direct purchase) | {crate names}
}

export interface EventMarketSource extends UnknownSource {
    readonly type: SourceType.EventMarket;
    readonly subtype: EventType;
    readonly name: undefined;
}

export interface MissionRewardSource extends UnknownSource {
    readonly type: SourceType.MissionReward;
    readonly subtype: undefined;
    readonly name: string;
}

export interface MarketSource extends UnknownSource {
    readonly type: SourceType.Market;
    readonly subtype: undefined;
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
    readonly subtype: undefined;
    readonly name: string;
    readonly id: string;
}

export interface ShopLevelSource extends UnknownSource {
    readonly type: SourceType.ShopLevel;
    readonly subtype: undefined;
    // level
    readonly name: string;
}
