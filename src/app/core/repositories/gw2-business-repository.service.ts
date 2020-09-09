import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {Build, CommercePrice, Item, Recipe} from '@app/core/models/gw2-business.model';
import {flatMap, map} from 'rxjs/operators';

@Injectable()
export class Gw2BusinessRepository {

  public readonly MAX_IDS = 200;

  private baseUrl = 'https://api.guildwars2.com/v2';
  private defaultParams = new HttpParams()
    .set('access_token', '')
    .set('lang', 'fr');

  private itemsEndpoint = '/items';
  private recipesEndpoint = '/recipes';
  private commercePricesEndpoint = '/commerce/prices';
  private buildEndpoint = '/build';

  constructor(private http: HttpClient) {
  }

  public getItemIds(): Observable<number[]> {
    const params = this.defaultParams;
    return this.http.get<number[]>(this.baseUrl + this.itemsEndpoint, {params});
  }

  public getItems(ids: number[]): Observable<Item[]> {
    return this.getItemsHelper(ids);
  }

  public getRecipeIds(): Observable<number[]> {
    const params = this.defaultParams;
    return this.http.get<number[]>(this.baseUrl + this.recipesEndpoint, {params});
  }

  public getRecipes(ids: number[]): Observable<Recipe[]> {
    return this.getRecipesHelper(ids);
  }

  public getCommercePriceIds(): Observable<number[]> {
    const params = this.defaultParams;
    return this.http.get<number[]>(this.baseUrl + this.commercePricesEndpoint, {params});
  }

  public getCommercePrices(ids: number[]): Observable<CommercePrice[]> {
    return this.getCommercePricesHelper(ids);
  }

  public getBuild(): Observable<Build> {
    const params = this.defaultParams;
    return this.http.get<Build>(this.baseUrl + this.buildEndpoint, {params});
  }

  private getItemsHelper(ids: number[]): Observable<Item[]> {
    if (ids.length === 0) {
      return of([]);
    } else if (ids.length <= this.MAX_IDS) {
      const params = this.defaultParams
        .set('ids', ids.join(','));
      return this.http.get<Item[]>(this.baseUrl + this.itemsEndpoint, {params});
    } else {
      const current = ids.slice(0, this.MAX_IDS);
      const remaining = ids.slice(this.MAX_IDS);
      const params = this.defaultParams
        .set('ids', current.join(','));
      return this.http.get<Item[]>(this.baseUrl + this.itemsEndpoint, {params})
        .pipe(
          flatMap(items => forkJoin([of(items), this.getItemsHelper(remaining)])),
          map(([a, b]) => a.concat(b))
        );
    }
  }

  private getRecipesHelper(ids: number[]): Observable<Recipe[]> {
    if (ids.length === 0) {
      return of([]);
    } else if (ids.length <= this.MAX_IDS) {
      const params = this.defaultParams
        .set('ids', ids.join(','));
      return this.http.get<Recipe[]>(this.baseUrl + this.recipesEndpoint, {params});
    } else {
      const current = ids.slice(0, this.MAX_IDS);
      const remaining = ids.slice(this.MAX_IDS);
      const params = this.defaultParams
        .set('ids', current.join(','));
      return this.http.get<Recipe[]>(this.baseUrl + this.recipesEndpoint, {params})
        .pipe(
          flatMap(recipes => forkJoin([of(recipes), this.getRecipesHelper(remaining)])),
          map(([a, b]) => a.concat(b))
        );
    }
  }

  private getCommercePricesHelper(ids: number[]): Observable<CommercePrice[]> {
    if (ids.length === 0) {
      return of([]);
    } else if (ids.length <= this.MAX_IDS) {
      const params = this.defaultParams
        .set('ids', ids.join(','));
      return this.http.get<CommercePrice[]>(this.baseUrl + this.commercePricesEndpoint, {params});
    } else {
      const current = ids.slice(0, this.MAX_IDS);
      const remaining = ids.slice(this.MAX_IDS);
      const params = this.defaultParams
        .set('ids', current.join(','));
      return this.http.get<CommercePrice[]>(this.baseUrl + this.commercePricesEndpoint, {params})
        .pipe(
          flatMap(commercePrices => forkJoin([of(commercePrices), this.getCommercePricesHelper(remaining)])),
          map(([a, b]) => a.concat(b))
        );
    }
  }
}
