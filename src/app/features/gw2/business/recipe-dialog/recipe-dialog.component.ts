import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig} from 'primeng';
import {CraftPrice, LocalRecipe, MinPrice, MinPriceSource} from '@app/shared/interfaces/gw2-business.interface';

@Component({
  selector: 'app-recipe-dialog',
  templateUrl: './recipe-dialog.component.html',
  styleUrls: ['./recipe-dialog.component.scss']
})
export class RecipeDialogComponent implements OnInit {

  craftPrice: CraftPrice;
  minPrices: Map<number, MinPrice>;
  recipes: Map<number, LocalRecipe[]>;

  craftStep: CraftStep;
  ingredients: string[];

  constructor(/*public ref: DynamicDialogRef,*/
              private config: DynamicDialogConfig) {
    this.craftPrice = config.data.craftPrice;
    this.minPrices = config.data.minPrices;
    this.recipes = config.data.recipes;
    this.config.header = this.craftPrice.name;
    this.config.styleClass = 'gw2-business-recipe-dialog';
  }

  ngOnInit(): void {
    const recipe = this.recipes.get(this.craftPrice.id).find(x => x.recipeId === this.craftPrice.recipeId);
    const subSteps = recipe.ingredients.map(x => this.getCraftStep(x.itemId, x.count));
    this.craftStep = {
      count: recipe.count,
      name: this.craftPrice.name,
      source: MinPriceSource.Craft,
      fragmented: false,
      price: subSteps.map(x => x.price).reduce((x, y) => x + y),
      subSteps
    };
    const map = new Map<string, number>();
    this.getIngredients(this.craftStep, map);
    this.ingredients = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => count + 'x ' + name);
  }

  private getCraftStep(id: number, count: number): CraftStep {
    const minPrice = this.minPrices.get(id);
    if (minPrice.source !== MinPriceSource.Craft) {
      return {
        count,
        name: minPrice.name,
        source: minPrice.source,
        fragmented: count % minPrice.count !== 0,
        price: Math.ceil(minPrice.price * count / minPrice.count)
      };
    } else {
      const recipe = this.recipes.get(id).find(x => x.recipeId === minPrice.recipeId);
      const res: CraftStep = {
        count,
        name: minPrice.name,
        source: MinPriceSource.Craft,
        fragmented: count % recipe.count !== 0,
        price: 0,
        subSteps: []
      };
      for (const ingredient of recipe.ingredients) {
        const subStep = this.getCraftStep(ingredient.itemId, Math.ceil(count * ingredient.count / recipe.count));
        res.price = res.price + subStep.price;
        res.subSteps.push(subStep);
      }
      return res;
    }
  }

  private getIngredients(step: CraftStep, map: Map<string, number>) {
    if (step.subSteps) {
      for (const subStep of step.subSteps) {
        this.getIngredients(subStep, map);
      }
    } else {
      if (!map.has(step.name)) {
        map.set(step.name, 0);
      }
      map.set(step.name, map.get(step.name) + step.count);
    }
  }

}

interface CraftStep {
  count: number;
  name: string;
  source: MinPriceSource;
  price: number;
  fragmented: boolean;
  subSteps?: CraftStep[];
}
