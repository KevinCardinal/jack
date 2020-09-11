import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {Gw2BusinessRepository} from '@app/core/repositories/gw2-business-repository.service';
import {gw2BusinessConfig} from '@env/environment';
import {ItemFlag, NpcPrice, RecipeFlag} from '@app/core/models/gw2-business.model';
import {CompressionService} from '@app/core/services/compression.service';
import {formatDate} from '@angular/common';


@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {

  // local storage ids
  private readonly keyPrefix = 'gw2-business-';
  private readonly versionKey = this.keyPrefix + 'version';
  private readonly mainBuildKey = this.keyPrefix + 'main-build';
  private readonly recipesKey = this.keyPrefix + 'recipes';
  private readonly itemsKey = this.keyPrefix + 'items';
  private readonly npcPricesKey = this.keyPrefix + 'npc-prices';
  private readonly commerceTimestampKey = this.keyPrefix + 'commerce-timestamp';
  private readonly commercePricesKey = this.keyPrefix + 'commerce-prices';

  maxIds: number;

  mainDataReady: boolean = false;
  mainDataMessage: string;
  mainDataMessageIsError: boolean = false;
  mainDataPercentage: number;

  pricesMessage: string;
  pricesPercentage: number;

  recipes: Map<number, LocalRecipe>;
  items: Map<number, LocalItem>;
  npcPrices: Map<number, NpcPrice>;
  commercePrices: Map<number, LocalCommercePrice>;

  constructor(private gw2BusinessRepository: Gw2BusinessRepository,
              private compressionService: CompressionService,
              @Inject(LOCALE_ID) private locale: string) {
    this.maxIds = this.gw2BusinessRepository.MAX_IDS;
  }

  ngOnInit(): void {
    if (this.getVersion() !== gw2BusinessConfig.version) {
      this.clearStorage();
      this.setVersion(gw2BusinessConfig.version);
    }

    const currentBuild = this.getBuild();
    this.gw2BusinessRepository.getBuild()
      .subscribe(build => {
        if (currentBuild == null) {
          this.mainDataMessage = 'Veuillez télécharger les données principales pour pouvoir continuer.';
        } else if (currentBuild !== build.id) {
          this.mainDataMessage = `La version de GW2 est différente de celle de vos données (vous = ${currentBuild}, GW2 = ${build.id}).`
            + ' Veuillez retélécharger les données principales.';
          this.mainDataMessageIsError = true;
        } else {
          this.mainDataMessage = 'Vos données principales sont à jour.';
          this.ngOnInitMainData();
        }
        this.mainDataReady = true;
      });
  }

  ngOnInitMainData(): void {
    this.recipes = new Map(this.getRecipes().map(recipe => [recipe.itemId, recipe]));
    this.items = new Map(this.getItems().map(item => [item.id, item]));
    this.npcPrices = new Map(this.getNpcPrices().map(npcPrice => [npcPrice.id, npcPrice]));
    const currentTimestamp = this.getCommerceTimestamp();
    if (currentTimestamp == null) {
      this.pricesMessage = 'Veuillez télécharger les prix pour pouvoir continuer.';
    } else {
      this.pricesMessage = 'La liste des prix date du ' + formatDate(currentTimestamp, 'dd-MM-yyyy', this.locale)
        + ' à ' + formatDate(currentTimestamp, 'HH:mm', this.locale) + '.';
      this.commercePrices = new Map(this.getCommercePrices().map(price => [price.id, price]));
      this.computeTableData();
    }
  }

  async uploadMainData(): Promise<void> {
    // Starting
    this.mainDataMessageIsError = false;
    const version = this.getVersion();
    this.clearStorage();
    this.setVersion(version);
    this.recipes = null;
    this.items = null;
    this.npcPrices = null;
    this.commercePrices = null;

    // Recipes ids
    this.mainDataMessage = 'Calcul ...';
    const recipeIds = await this.gw2BusinessRepository.getRecipeIds().toPromise();

    // Recipes
    this.mainDataMessage = '1/3 Téléchargement des recettes ...';
    const localRecipes: LocalRecipe[] = [];
    for (let i = 0; i < recipeIds.length; i += this.maxIds) {
      this.mainDataPercentage = Math.floor(i * 100 / recipeIds.length);
      const currentIds = recipeIds.slice(i, Math.min(i + this.maxIds, recipeIds.length));
      const currentLocalRecipes: LocalRecipe[] = (await this.gw2BusinessRepository.getRecipes(currentIds).toPromise())
        .map(x => ({
          itemId: x.output_item_id,
          count: x.output_item_count,
          autoLearned: !x.flags.find(y => y === RecipeFlag.LearnedFromItem),
          ingredients: x.ingredients.map(y => ({
            itemId: y.item_id,
            count: y.count
          }))
        }));
      localRecipes.push(...currentLocalRecipes);
    }

    // Items Ids
    this.mainDataMessage = 'Calcul ...';
    this.mainDataPercentage = null;
    const itemIdsSet = new Set<number>();
    for (const localRecipe of localRecipes) {
      itemIdsSet.add(localRecipe.itemId);
      localRecipe.ingredients.map(x => x.itemId).forEach(x => itemIdsSet.add(x));
    }
    const itemIds = Array.from(itemIdsSet);

    // Items
    this.mainDataMessage = '2/3 Téléchargement des items ...';
    const localItems: LocalItem[] = [];
    for (let i = 0; i < itemIds.length; i += this.maxIds) {
      this.mainDataPercentage = Math.floor(i * 100 / itemIds.length);
      const currentIds = itemIds.slice(i, Math.min(i + this.maxIds, itemIds.length));
      const currentLocalItems: LocalItem[] = (await this.gw2BusinessRepository.getItems(currentIds).toPromise())
        .map(x => ({
          id: x.id,
          name: x.name,
          sellable: !x.flags.find(flag => flag === ItemFlag.AccountBound || flag === ItemFlag.NoSell || flag === ItemFlag.SoulbindOnAcquire)
        }));
      localItems.push(...currentLocalItems);
    }

    // Npc prices
    this.mainDataMessage = '3/3 Téléchargement des prix des PNJ ...';
    this.mainDataPercentage = null;
    const npcPrices: NpcPrice[] = [];
    for (let i = 0; i < itemIds.length; i += this.maxIds) {
      this.mainDataPercentage = Math.floor(i * 100 / itemIds.length);
      const currentIds = itemIds.slice(i, Math.min(i + this.maxIds, itemIds.length));
      const currentNpcPrices: NpcPrice[] = await this.gw2BusinessRepository.getNpcPrices(currentIds).toPromise();
      npcPrices.push(...currentNpcPrices);
    }

    // Storage
    this.mainDataMessage = 'Calcul ...';
    this.mainDataPercentage = null;
    this.setRecipes(localRecipes);
    this.setItems(localItems);
    this.setNpcPrices(npcPrices);
    this.setBuild((await this.gw2BusinessRepository.getBuild().toPromise()).id);
    this.recipes = new Map(localRecipes.map(recipe => [recipe.itemId, recipe]));
    this.items = new Map(localItems.map(item => [item.id, item]));
    this.npcPrices = new Map(npcPrices.map(npcPrice => [npcPrice.id, npcPrice]));

    // Final
    this.mainDataMessage = 'Vos données principales sont à jour.';
  }

  async uploadPrices(): Promise<void> {
    // Start
    this.commercePrices = null;
    const itemIds = Array.from(this.items.keys());

    // Commerce prices
    this.pricesMessage = '1/1 Téléchargement des prix ...';
    const localCommercePrices: LocalCommercePrice[] = [];
    for (let i = 0; i < itemIds.length; i += this.maxIds) {
      this.pricesPercentage = Math.floor(i * 100 / itemIds.length);
      const currentIds = itemIds.slice(i, Math.min(i + this.maxIds, itemIds.length));
      const currentLocalCommercePrices: LocalCommercePrice[] = (await this.gw2BusinessRepository.getCommercePrices(currentIds).toPromise())
        .map(x => ({
          id: x.id,
          price: x.sells && x.sells.quantity && x.sells.quantity > 0 ? x.sells.unit_price : null
        }))
        .filter(x => x.price != null);
      localCommercePrices.push(...currentLocalCommercePrices);
    }

    // Storage
    this.pricesMessage = 'Calcul ...';
    this.pricesPercentage = null;
    this.setCommercePrices(localCommercePrices);
    const timestamp = new Date()
    this.setCommerceTimestamp(timestamp);
    this.commercePrices = new Map(localCommercePrices.map(price => [price.id, price]));

    // Final
    this.pricesMessage = 'La liste des prix date du ' + formatDate(timestamp, 'dd-MM-yyyy', this.locale)
      + ' à ' + formatDate(timestamp, 'HH:mm', this.locale) + '.';
    this.computeTableData();
  }

  computeTableData(): void {
  }

  private getVersion(): string | null {
    return localStorage.getItem(this.versionKey);
  }

  private setVersion(version: string): void {
    return localStorage.setItem(this.versionKey, version);
  }

  private getBuild(): number | null {
    const res = localStorage.getItem(this.mainBuildKey);
    return res == null ? null : Number(res);
  }

  private setBuild(build: number): void {
    localStorage.setItem(this.mainBuildKey, String(build));
  }

  private getRecipes(): LocalRecipe[] | null {
    const res = localStorage.getItem(this.recipesKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setRecipes(recipes: LocalRecipe[]): void {
    localStorage.setItem(this.recipesKey, this.compressionService.compressObject(recipes));
  }

  private getItems(): LocalItem[] | null {
    const res = localStorage.getItem(this.itemsKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setItems(items: LocalItem[]): void {
    localStorage.setItem(this.itemsKey, this.compressionService.compressObject(items));
  }

  private getNpcPrices(): NpcPrice[] | null {
    const res = localStorage.getItem(this.npcPricesKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setNpcPrices(npcPrices: NpcPrice[]): void {
    localStorage.setItem(this.npcPricesKey, this.compressionService.compressObject(npcPrices));
  }

  private getCommerceTimestamp(): Date | null {
    const res = localStorage.getItem(this.commerceTimestampKey);
    return res == null ? null : new Date(res);
  }

  private setCommerceTimestamp(timestamp: Date): void {
    localStorage.setItem(this.commerceTimestampKey, timestamp.toString());
  }

  private getCommercePrices(): LocalCommercePrice[] | null {
    const res = localStorage.getItem(this.commercePricesKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setCommercePrices(commercePrices: LocalCommercePrice[]): void {
    localStorage.setItem(this.commercePricesKey, this.compressionService.compressObject(commercePrices));
  }

  private clearStorage(): void {
    console.log('clearStorage');
    localStorage.removeItem(this.versionKey);
    localStorage.removeItem(this.mainBuildKey);
    localStorage.removeItem(this.recipesKey);
    localStorage.removeItem(this.itemsKey);
    localStorage.removeItem(this.npcPricesKey);
    localStorage.removeItem(this.commerceTimestampKey);
    localStorage.removeItem(this.commercePricesKey);
  }
}

interface LocalRecipeIngredient {
  itemId: number;
  count: number;
}

interface LocalRecipe {
  itemId: number;
  count: number;
  autoLearned: boolean;
  ingredients: LocalRecipeIngredient[];
}

interface LocalItem {
  id: number;
  name: string;
  sellable: boolean;
}

interface LocalCommercePrice {
  id: number;
  price: number;
}
