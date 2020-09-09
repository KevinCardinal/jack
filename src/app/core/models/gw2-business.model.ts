export enum ItemType {
  Armor = 'Armor',
  Back = 'Back',
  Bag = 'Bag',
  Consumable = 'Consumable',
  Container = 'Container',
  CraftingMaterial = 'CraftingMaterial',
  Gathering = 'Gathering',
  Gizmo = 'Gizmo',
  Key = 'Key',
  MiniPet = 'MiniPet',
  Tool = 'Tool',
  Trait = 'Trait',
  Trinket = 'Trinket',
  Trophy = 'Trophy',
  UpgradeComponent = 'UpgradeComponent',
  Weapon = 'Weapon'
}

export enum ItemRarity {
  Junk = 'Junk',
  Basic = 'Basic',
  Fine = 'Fine',
  Masterwork = 'Masterwork',
  Rare = 'Rare',
  Exotic = 'Exotic',
  Ascended = 'Ascended',
  Legendary = 'Legendary'
}

export enum ItemFlag {
  AccountBindOnUse = 'AccountBindOnUse',
  AccountBound = 'AccountBound',
  Attuned = 'Attuned',
  BulkConsume = 'BulkConsume',
  DeleteWarning = 'DeleteWarning',
  HideSuffix = 'HideSuffix',
  Infused = 'Infused',
  MonsterOnly = 'MonsterOnly',
  NoMysticForge = 'NoMysticForge',
  NoSalvage = 'NoSalvage',
  NoSell = 'NoSell',
  NotUpgradeable = 'NotUpgradeable',
  NoUnderwater = 'NoUnderwater',
  SoulbindOnAcquire = 'SoulbindOnAcquire',
  SoulBindOnUse = 'SoulBindOnUse',
  Tonic = 'Tonic',
  Unique = 'Unique'
}

export enum ItemGameType {
  Activity = 'Activity',
  Dungeon = 'Dungeon',
  Pve = 'Pve',
  Pvp = 'Pvp',
  PvpLobby = 'PvpLobby',
  Wvw = 'Wvw'
}

export enum ItemRestriction {
  Asura = 'Asura',
  Charr = 'Charr',
  Female = 'Female',
  Human = 'Human',
  Norn = 'Norn',
  Sylvari = 'Sylvari',
  Elementalist = 'Elementalist',
  Engineer = 'Engineer',
  Guardian = 'Guardian',
  Mesmer = 'Mesmer',
  Necromancer = 'Necromancer',
  Ranger = 'Ranger',
  Thief = 'Thief',
  Warrior = 'Warrior'
}

export enum ItemUpgradeUpgrade {
  Attunement = 'Attunement',
  Infusion = 'Infusion'
}

export class ItemUpgrade {
  upgrade: ItemUpgradeUpgrade;
  item_id: number;
}

export class Item {
  id: number;
  chat_link: string;
  name: string;
  icon?: string;
  description?: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  vendor_value: number;
  default_skin?: number;
  flags: ItemFlag[];
  game_types: ItemGameType[];
  restrictions: ItemRestriction[];
  upgrades_into?: ItemUpgrade[];
  upgrades_from?: ItemUpgrade[];
  details?: any;
}

export enum RecipeType {
  // Weapon Recipes
  Axe = 'Axe',
  Dagger = 'Dagger',
  Focus = 'Focus',
  GreatSword = 'GreatSword',
  Hammer = 'Hammer',
  Harpoon = 'Harpoon',
  LongBow = 'LongBow',
  Mace = 'Mace',
  Pistol = 'Pistol',
  Rifle = 'Rifle',
  Scepter = 'Scepter',
  Shield = 'Shield',
  ShortBow = 'ShortBow',
  Speargun = 'Speargun',
  Staff = 'Staff',
  Sword = 'Sword',
  Torch = 'Torch',
  Trident = 'Trident',
  Warhorn = 'Warhorn',
  // Armor recipes
  Boots = 'Boots',
  Coat = 'Coat',
  Gloves = 'Gloves',
  Helm = 'Helm',
  Leggings = 'Leggings',
  Shoulders = 'Shoulders',
  // Trinket recipes
  Amulet = 'Amulet',
  Earring = 'Earring',
  Ring = 'Ring',
  // Food recipes
  Dessert = 'Dessert',
  Feast = 'Feast',
  IngredientCooking = 'IngredientCooking',
  Meal = 'Meal',
  Seasoning = 'Seasoning',
  Snack = 'Snack',
  Soup = 'Soup',
  Food = 'Food',
  // Crafting component recipes
  Component = 'Component',
  Inscription = 'Inscription',
  Insignia = 'Insignia',
  LegendaryComponent = 'LegendaryComponent',
  // Refinement recipes
  Refinement = 'Refinement',
  RefinementEctoplasm = 'RefinementEctoplasm',
  RefinementObsidian = 'RefinementObsidian',
  // Guild recipes
  GuildConsumable = 'GuildConsumable',
  GuildDecoration = 'GuildDecoration',
  GuildConsumableWvw = 'GuildConsumableWvw',
  // Other recipes
  Backpack = 'Backpack',
  Bag = 'Bag',
  Bulk = 'Bulk',
  Consumable = 'Consumable',
  Dye = 'Dye',
  Potion = 'Potion',
  UpgradeComponent = 'UpgradeComponent'
}

export enum RecipeDiscipline {
  Artificer = 'Artificer',
  Armorsmith = 'Armorsmith',
  Chef = 'Chef',
  Huntsman = 'Huntsman',
  Jeweler = 'Jeweler',
  Leatherworker = 'Leatherworker',
  Tailor = 'Tailor',
  Weaponsmith = 'Weaponsmith',
  Scribe = 'Scribe'
}

export enum RecipeFlag {
  AutoLearned = 'AutoLearned',
  LearnedFromItem = 'LearnedFromItem'
}

export class RecipeIngredient {
  item_id: number;
  count: number;
}

export class RecipeGuildIngredient {
  upgrade_id: number;
  count: number;
}

export class Recipe {
  id: number;
  type: RecipeType;
  output_item_id: number;
  output_item_count: number;
  time_to_craft_ms: number;
  disciplines: RecipeDiscipline[];
  min_rating: number;
  flags: RecipeFlag[];
  ingredients: RecipeIngredient[];
  guild_ingredients: RecipeGuildIngredient[];
  output_upgrade_id?: number;
  chat_link: string;
}

export class CommercePriceInformation {
  unit_price: number;
  quantity: number;
}

export class CommercePrice {
  id: number;
  whitelisted: boolean;
  buys: CommercePriceInformation;
  sells: CommercePriceInformation;
}

export class Build {
  id: number;
}
