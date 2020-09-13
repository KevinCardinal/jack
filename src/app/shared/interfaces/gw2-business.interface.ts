import {RecipeDiscipline} from '@app/core/models/gw2-business.model';

export interface LocalRecipeIngredient {
  itemId: number;
  count: number;
}

export interface LocalRecipe {
  recipeId: number;
  itemId: number;
  count: number;
  autoLearned: boolean;
  ingredients: LocalRecipeIngredient[];
  disciplines: RecipeDiscipline[];
  level: number;
}

export interface LocalItem {
  id: number;
  name: string;
  sellable: boolean;
  icon: string;
}

export interface LocalCommercePrice {
  id: number;
  price: number;
  quantity: number;
}

export enum MinPriceSource {
  Unknown = 'Unknown',
  Craft = 'Craft',
  NPC = 'NPC',
  HDV = 'HDV'
}

export interface MinPrice {
  id: number;
  name: string;
  count: number;
  price: number;
  source: MinPriceSource;
  containsUnknown: boolean;
  containsNotAutoLearned: boolean;
}

export interface CraftPrice extends MinPrice {
  sellingPrice: number;
  sellingQuantity: number;
  sellingProfit: number;
  sellable: boolean;
  buyingPrice: number;
  buyingQuantity: number;
  buyingProfit: number;
  disciplines: RecipeDiscipline[];
  level: number;
  icon: string;
}
