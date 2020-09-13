import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {Gw2BusinessRepository} from '@app/core/repositories/gw2-business-repository.service';
import {gw2BusinessConfig} from '@env/environment';
import {Gw2Currency, ItemFlag, NpcPrice, RecipeDiscipline, RecipeFlag} from '@app/core/models/gw2-business.model';
import {CompressionService} from '@app/core/services/compression.service';
import {formatDate} from '@angular/common';
import {DialogService, MessageService, SelectItem} from 'primeng';
import {RecipeDialogComponent} from '@app/features/gw2/business/recipe-dialog/recipe-dialog.component';
import {
  CraftPrice,
  LocalCommercePrice,
  LocalItem,
  LocalRecipe,
  MinPrice,
  MinPriceSource
} from '@app/shared/interfaces/gw2-business.interface';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';


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
  private readonly commerceBuyPricesKey = this.keyPrefix + 'commerce-buy-prices';

  maxIds: number;

  mainDataReady = false;
  mainDataMessage: string;
  mainDataMessageIsError = false;
  mainDataPercentage: number;

  pricesMessage: string;
  pricesPercentage: number;

  recipes: Map<number, LocalRecipe>;
  items: Map<number, LocalItem>;
  npcPrices: Map<number, NpcPrice>;
  commercePrices: Map<number, LocalCommercePrice>;
  commerceBuyPrices: Map<number, LocalCommercePrice>;
  minPrices: Map<number, MinPrice>;
  craftPrices: CraftPrice[];
  filteredCraftPrices: CraftPrice[];

  formGroup: FormGroup;
  search: string;
  selectedDisciplines: RecipeDiscipline[] = [];
  disciplineOptions: SelectItem[];
  minRating: number;
  maxRating: number;
  unknownSource = true;
  notAutoLearnedRecipes = true;
  notSellable = true;
  offerMode = true;
  modeOptions: SelectItem[];

  constructor(private gw2BusinessRepository: Gw2BusinessRepository,
              private compressionService: CompressionService,
              private dialogService: DialogService,
              private formBuilder: FormBuilder,
              private translateService: TranslateService,
              private messageService: MessageService,
              @Inject(LOCALE_ID) private locale: string) {
    this.maxIds = this.gw2BusinessRepository.MAX_IDS;
  }

  ngOnInit(): void {
    if (this.getVersion() !== gw2BusinessConfig.version) {
      this.clearStorage();
      this.setVersion(gw2BusinessConfig.version);
    }

    this.buildForm();

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
      }, () => this.toastError());
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
      this.commerceBuyPrices = new Map(this.getCommerceBuyPrices().map(price => [price.id, price]));
      this.computeTableData();
    }
  }

  private buildForm(): void {
    this.disciplineOptions = Object.keys(RecipeDiscipline).map(k => RecipeDiscipline[k] as RecipeDiscipline)
      .map(x => ({label: this.translateService.instant(x), value: x}))
      .sort((a, b) => a.label.localeCompare(b.label));
    this.modeOptions = [
      {label: 'Mode offre', value: true},
      {label: 'Mode demande', value: false}
    ];
    this.formGroup = this.formBuilder.group({
      search: new FormControl(this.search),
      selectedDisciplines: new FormControl(this.selectedDisciplines),
      minRating: new FormControl(this.minRating, [Validators.min(0), Validators.max(500)]),
      maxRating: new FormControl(this.maxRating, [Validators.min(0), Validators.max(500)]),
      notAutoLearnedRecipes: new FormControl(this.notAutoLearnedRecipes),
      unknownSource: new FormControl(this.unknownSource),
      notSellable: new FormControl(this.notSellable),
      offerMode: new FormControl(this.modeOptions, [Validators.required])
    });
  }

  async uploadMainData(): Promise<void> {
    try {
      // Starting
      this.mainDataMessageIsError = false;
      const version = this.getVersion();
      this.clearStorage();
      this.setVersion(version);
      this.recipes = null;
      this.items = null;
      this.npcPrices = null;
      this.commercePrices = null;
      this.commerceBuyPrices = null;
      this.minPrices = null;
      this.craftPrices = null;
      this.filteredCraftPrices = null;

      // Recipes ids
      this.mainDataMessage = 'Calcul ...';
      const recipeIds = await this.gw2BusinessRepository.getRecipeIds().toPromise();

      // Recipes
      this.mainDataMessage = '1/3 Téléchargement des recettes ...';
      let localRecipes: LocalRecipe[] = [];
      for (let i = 0; i < recipeIds.length; i += this.maxIds) {
        this.mainDataPercentage = Math.floor(i * 100 / recipeIds.length);
        const currentIds = recipeIds.slice(i, Math.min(i + this.maxIds, recipeIds.length));
        const currentLocalRecipes: LocalRecipe[] = (await this.gw2BusinessRepository.getRecipes(currentIds).toPromise())
          .map(x => ({
            recipeId: x.id,
            itemId: x.output_item_id,
            count: x.output_item_count,
            autoLearned: !x.flags.find(y => y === RecipeFlag.LearnedFromItem),
            ingredients: x.ingredients.map(y => ({
              itemId: y.item_id,
              count: y.count
            })),
            disciplines: x.disciplines,
            level: x.min_rating
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
            sellable: !x.flags.find(flag => flag === ItemFlag.AccountBound || flag === ItemFlag.SoulbindOnAcquire),
            icon: x.icon
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
      const trueItemIds = new Set(localItems.map(item => item.id));
      localRecipes = localRecipes.filter(recipe => trueItemIds.has(recipe.itemId)); // Remove items who aren't items ...
      this.setRecipes(localRecipes);
      this.setItems(localItems);
      this.setNpcPrices(npcPrices);
      this.setBuild((await this.gw2BusinessRepository.getBuild().toPromise()).id);
      this.recipes = new Map(localRecipes.map(recipe => [recipe.itemId, recipe]));
      this.items = new Map(localItems.map(item => [item.id, item]));
      this.npcPrices = new Map(npcPrices.map(npcPrice => [npcPrice.id, npcPrice]));

      // Final
      this.pricesMessage = 'Veuillez télécharger les prix pour pouvoir continuer.';
      this.mainDataMessage = 'Vos données principales sont à jour.';
    } catch (e) {
      this.toastError();
    }
  }

  async uploadPrices(): Promise<void> {
    try {
      // Start
      this.commercePrices = null;
      this.commerceBuyPrices = null;
      this.minPrices = null;
      this.craftPrices = null;
      this.filteredCraftPrices = null;
      const itemIds = Array.from(this.items.keys());

      // Commerce prices
      this.pricesMessage = '1/1 Téléchargement des prix ...';
      const localCommercePrices: LocalCommercePrice[] = [];
      const localCommerceBuyPrices: LocalCommercePrice[] = [];
      for (let i = 0; i < itemIds.length; i += this.maxIds) {
        this.pricesPercentage = Math.floor(i * 100 / itemIds.length);
        const currentIds = itemIds.slice(i, Math.min(i + this.maxIds, itemIds.length));
        const currentCommercePrices = await this.gw2BusinessRepository.getCommercePrices(currentIds).toPromise();
        const currentLocalCommercePrices: LocalCommercePrice[] = currentCommercePrices
          .map(x => ({
            id: x.id,
            price: x.sells && x.sells.quantity && x.sells.quantity > 0 ? x.sells.unit_price : null,
            quantity: x.sells && x.sells.quantity && x.sells.quantity > 0 ? x.sells.quantity : null
          }))
          .filter(x => x.price != null);
        const currentLocalCommerceBuyPrices: LocalCommercePrice[] = currentCommercePrices
          .map(x => ({
            id: x.id,
            price: x.buys && x.buys.quantity && x.buys.quantity > 0 ? x.buys.unit_price : null,
            quantity: x.buys && x.buys.quantity && x.buys.quantity > 0 ? x.buys.quantity : null
          }))
          .filter(x => x.price != null);
        localCommercePrices.push(...currentLocalCommercePrices);
        localCommerceBuyPrices.push(...currentLocalCommerceBuyPrices);
      }

      // Storage
      this.pricesMessage = 'Calcul ...';
      this.pricesPercentage = null;
      this.setCommercePrices(localCommercePrices);
      this.setCommerceBuyPrices(localCommerceBuyPrices);
      const timestamp = new Date();
      this.setCommerceTimestamp(timestamp);
      this.commercePrices = new Map(localCommercePrices.map(price => [price.id, price]));
      this.commerceBuyPrices = new Map(localCommerceBuyPrices.map(price => [price.id, price]));

      // Final
      this.pricesMessage = 'La liste des prix date du ' + formatDate(timestamp, 'dd-MM-yyyy', this.locale)
        + ' à ' + formatDate(timestamp, 'HH:mm', this.locale) + '.';
      this.computeTableData();
    } catch (e) {
      this.toastError();
    }
  }

  computeTableData(): void {
    this.minPrices = new Map();
    this.craftPrices = null;
    this.filteredCraftPrices = null;
    const craftPrices: CraftPrice[] = [];
    for (const recipe of Array.from(this.recipes.values())) {
      const item = this.items.get(recipe.itemId);
      const commercePrice = this.commercePrices.get(recipe.itemId);
      const commerceBuyPrice = this.commerceBuyPrices.get(recipe.itemId);
      const craftPrice: CraftPrice = {
        id: recipe.itemId,
        name: item.name,
        count: recipe.count,
        price: 0,
        source: MinPriceSource.Craft,
        containsUnknown: false,
        containsNotAutoLearned: !recipe.autoLearned,
        sellable: item.sellable,
        sellingPrice: commercePrice ? commercePrice.price * recipe.count : 0,
        sellingQuantity: commercePrice ? commercePrice.quantity : 0,
        buyingPrice: commerceBuyPrice ? commerceBuyPrice.price * recipe.count : 0,
        buyingQuantity: commerceBuyPrice ? commerceBuyPrice.quantity : 0,
        disciplines: recipe.disciplines,
        level: recipe.level,
        sellingProfit: null,
        buyingProfit: null,
        icon: item.icon
      };
      this.getMinPrice(recipe.itemId);
      for (const ingredient of recipe.ingredients) {
        const minPrice = this.getMinPrice(ingredient.itemId);
        craftPrice.price = craftPrice.price + Math.ceil(minPrice.price * ingredient.count * craftPrice.count / minPrice.count);
        craftPrice.containsUnknown = craftPrice.containsUnknown || minPrice.containsUnknown;
        craftPrice.containsNotAutoLearned = craftPrice.containsNotAutoLearned || minPrice.containsNotAutoLearned;
      }
      craftPrice.sellingProfit = Math.floor(craftPrice.sellingPrice * 0.85) - craftPrice.price;
      craftPrice.buyingProfit = Math.floor(craftPrice.buyingPrice * 0.85) - craftPrice.price;
      craftPrices.push(craftPrice);
    }
    this.craftPrices = craftPrices;
    this.filterTableData();
  }

  filterTableData(): void {
    console.log('filterTableData');
    if (this.formGroup.valid) {
      this.filteredCraftPrices = null;
      this.filteredCraftPrices = this.craftPrices
        .filter(x => this.hasSearch(x))
        .filter(x => this.hasSelectedDisciplines(x))
        .filter(x => this.minRating == null ? true : x.level >= this.minRating)
        .filter(x => this.maxRating == null ? true : x.level <= this.maxRating)
        .filter(x => this.unknownSource || !x.containsUnknown)
        .filter(x => this.notAutoLearnedRecipes || !x.containsNotAutoLearned)
        .filter(x => this.notSellable || x.sellable)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  private hasSelectedDisciplines(craftPrice: CraftPrice): boolean {
    if (!this.selectedDisciplines || this.selectedDisciplines.length === 0) {
      return true;
    } else {
      return craftPrice.disciplines.filter(discipline => this.selectedDisciplines.includes(discipline)).length > 0;
    }
  }

  private hasSearch(craftPrice: CraftPrice): boolean {
    if (!this.search) {
      return true;
    }
    const keyWords = this.search.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ');
    const name = craftPrice.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return keyWords.filter(keyWord => name.includes(keyWord)).length === keyWords.length;
  }

  showRecipe(craftPrice: CraftPrice): void {
    this.dialogService.open(RecipeDialogComponent, {
      data: {
        craftPrice,
        minPrices: this.minPrices,
        recipes: this.recipes
      }
    });
  }

  private getMinPrice(id: number): MinPrice {
    let res: MinPrice = this.minPrices.get(id);
    if (res) {
      return res;
    }
    const item = this.items.get(id);

    // NPC
    const npcPrice = this.npcPrices.get(id);
    if (npcPrice) {
      const price = npcPrice.price.find(x => x.currency === Gw2Currency.Gold);
      if (price) {
        res = {
          id,
          name: item.name,
          count: npcPrice.count,
          price: price.amount,
          source: MinPriceSource.NPC,
          containsUnknown: false,
          containsNotAutoLearned: false
        };
      }
    }

    // Commerce
    const commercePrice = this.commercePrices.get(id);
    if (commercePrice && (!res || commercePrice.price < res.price / res.count)) {
      res = {
        id,
        name: item.name,
        count: 1,
        price: commercePrice.price,
        source: MinPriceSource.HDV,
        containsUnknown: false,
        containsNotAutoLearned: false,
      };
    }

    // Recipe
    const recipe = this.recipes.get(id);
    if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
      const temp: MinPrice = {
        id,
        name: item.name,
        count: recipe.count,
        price: 0,
        source: MinPriceSource.Craft,
        containsUnknown: false,
        containsNotAutoLearned: !recipe.autoLearned
      };
      for (const ingredient of recipe.ingredients) {
        const ingredientMinPrice = this.getMinPrice(ingredient.itemId);
        const price = Math.ceil(ingredientMinPrice.price * ingredient.count * temp.count / ingredientMinPrice.count);
        temp.price = temp.price + price;
        temp.containsUnknown = temp.containsUnknown || ingredientMinPrice.containsUnknown;
        temp.containsNotAutoLearned = temp.containsNotAutoLearned || ingredientMinPrice.containsNotAutoLearned;
      }
      if (!res || temp.price / temp.count < res.price / res.count) {
        res = temp;
      }
    }

    // Default
    if (!res) {
      res = {
        id,
        name: item.name,
        count: 1,
        price: 0,
        source: MinPriceSource.Unknown,
        containsUnknown: true,
        containsNotAutoLearned: false
      };
    }

    this.minPrices.set(res.id, res);
    return res;
  }

  private toastError(): void {
    this.messageService.add({
      key: 'toast',
      severity: 'error',
      summary: 'Erreur',
      detail: 'Une erreur est survenue, veuillez actualiser la page.'
    });
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

  private getCommerceBuyPrices(): LocalCommercePrice[] | null {
    const res = localStorage.getItem(this.commerceBuyPricesKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setCommerceBuyPrices(commerceBuyPrices: LocalCommercePrice[]): void {
    localStorage.setItem(this.commerceBuyPricesKey, this.compressionService.compressObject(commerceBuyPrices));
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
    localStorage.removeItem(this.commerceBuyPricesKey);
  }
}
