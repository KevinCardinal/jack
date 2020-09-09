import {Component, OnInit} from '@angular/core';
import {Gw2BusinessRepository} from '@app/core/repositories/gw2-business-repository.service';
import {gw2BusinessConfig} from '@env/environment';
import {ItemFlag, RecipeFlag} from '@app/core/models/gw2-business.model';
import {CompressionService} from '@app/core/services/compression.service';


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

  maxIds: number;

  mainDataReady: boolean = false;
  mainDataMessage: string;
  mainDataMessageIsError: boolean = false;
  mainDataPercentage: number;

  recipes: Map<number, LocalRecipe>;
  items: Map<number, LocalItem>;

  constructor(private gw2BusinessRepository: Gw2BusinessRepository,
              private compressionService: CompressionService) {
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
          this.mainDataMessage = 'Vos données principales sont à jour';
          this.ngOnInitMainData();
        }
        this.mainDataReady = true;
      });
  }

  ngOnInitMainData(): void {
    this.recipes = new Map(this.getRecipes().map(recipe => [recipe.itemId, recipe]));
    this.items = new Map(this.getItems().map(item => [item.id, item]));
  }

  async uploadMainData(): Promise<void> {
    // Starting
    this.mainDataMessageIsError = false;

    // Recipes ids
    this.mainDataMessage = 'Calcul ...';
    const recipeIds = await this.gw2BusinessRepository.getRecipeIds().toPromise();

    // Recipes
    this.mainDataMessage = '1/2 Téléchargement des recettes ...';
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
    this.mainDataMessage = '2/2 Téléchargement des items ...';
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

    // Storage
    this.mainDataMessage = 'Calcul ...';
    this.mainDataPercentage = null;
    this.setRecipes(localRecipes);
    this.setItems(localItems);
    this.setBuild((await this.gw2BusinessRepository.getBuild().toPromise()).id);
    this.recipes = new Map(localRecipes.map(recipe => [recipe.itemId, recipe]));
    this.items = new Map(localItems.map(item => [item.id, item]));

    // Final
    this.mainDataMessage = 'Vos données principales sont à jour';
  }

  private getVersion(): string | null {
    return localStorage.getItem(this.versionKey);
  }

  private setVersion(version: string) {
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

  private setRecipes(recipes: LocalRecipe[]) {
    localStorage.setItem(this.recipesKey, this.compressionService.compressObject(recipes));
  }

  private getItems(): LocalItem[] | null {
    const res = localStorage.getItem(this.itemsKey);
    return res == null ? null : this.compressionService.decompressObject(res);
  }

  private setItems(items: LocalItem[]) {
    localStorage.setItem(this.itemsKey, this.compressionService.compressObject(items));
  }

  private clearStorage(): void {
    console.log('clearStorage');
    localStorage.removeItem(this.versionKey);
    localStorage.removeItem(this.mainBuildKey);
    localStorage.removeItem(this.recipesKey);
    localStorage.removeItem(this.itemsKey);
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
