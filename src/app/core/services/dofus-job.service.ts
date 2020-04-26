import {Injectable} from '@angular/core';
import {CraftCategory, Job} from '../models/dofus-job.model';
import {Maps} from '../utils/maps.util';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {map} from 'rxjs/operators';
import {Strings} from '@app/core/utils/strings.util';

@Injectable()
export class DofusJobService {

  private MIN_LEVEL = 1;
  private MAX_LEVEL = 200;

  constructor() {}

  public getJobs(): Observable<Job[]> {
    const res = Maps.entrySet(jobs).map(entry => {
      return {id: entry.key, name: entry.value.label};
    });
    res.sort((a, b) => Strings.compare(a.name, b.name));
    return of(res);
  }

  public getCraftCategories(jobId: string): Observable<CraftCategory[]> {
    const job = jobs.get(jobId);
    if (job == null) {
      return throwError(new Error('No job with id = \'' + jobId + '\''));
    } else {
      const res = job.craftCategoryIds.map(id => {
        return {id, name: craftCategories.get(id).label};
      });
      res.sort((a, b) => Strings.compare(a.name, b.name));
      return of(res);
    }
  }

  private getCraftCategoryInfo(craftCategoryId: string): Observable<CraftCategoryInfo> {
    const craftCategoryInfo = craftCategories.get(craftCategoryId);
    if (craftCategoryInfo == null) {
      return throwError(new Error('No craft category with id = \'' + craftCategoryId + '\''));
    } else {
      return of(craftCategoryInfo);
    }
  }

  public convertLevelTpXp(level: number): Observable<number> {
    if (level < this.MIN_LEVEL || level > this.MAX_LEVEL) {
      return throwError(new Error('Level isn\'t valid'));
    } else {
      return of(level * (level - 1) * 10);
    }
  }

  public convertXpToLevel(xp: number): Observable<number> {
    if (xp < 0) {
      return throwError(new Error('Xp can\'t be negative'));
    }
    const lvl = this.unsafeConvertXpToLevel(xp);
    if (lvl <= this.MAX_LEVEL) {
      return of(lvl);
    } else {
      return throwError(new Error('Xp is too big'));
    }
  }

  private unsafeConvertXpToLevel(xp: number): number {
    let lvl = 1;
    let step = 20;
    while (xp >= step && lvl <= this.MAX_LEVEL) {
      lvl++;
      step += 20 * lvl;
    }
    return lvl;
  }

  public remainingCrafts(startXp: number, endXp: number, craftCategoryId: string, craftLevel: number): Observable<number> {
    return forkJoin([
      this.convertXpToLevel(startXp),
      this.getCraftCategoryInfo(craftCategoryId)
    ]).pipe(map(array => {
      const startLevel: number = array[0];
      const craft: CraftCategoryInfo = array[1];
      if (startLevel < craftLevel) {
        throw new Error('Craft level is greater than start xp\'s level');
      }
      if (startXp > endXp) {
        throw new Error('Start xp is greater than end xp');
      }
      let currentXp = startXp;
      let count = 0;
      while (currentXp < endXp && !isNaN(count)) {
        const xpGain = this.craftXp(currentXp, craftLevel, craft);
        console.log(xpGain);
        if (xpGain === 0) {
          count = NaN;
        } else {
          currentXp += xpGain;
          count++;
        }
      }
      return count;
    }));
  }

  private craftXp(startXp: number, craftLevel: number, craft: CraftCategoryInfo): number {
    const startLevel = this.unsafeConvertXpToLevel(startXp);
    if (startLevel - craftLevel > 100) {
      return 0;
    } else {
      const coef = craftLevel === 1 ? craft.startCoef : craft.coef;
      return Math.floor(coef * craftLevel * lvlDiffCoef[startLevel - craftLevel]);
    }
  }
}

class JobInfo {
  label: string;
  craftCategoryIds: string[];

  constructor(label: string, craftCategoryIds: string[]) {
    this.label = label;
    this.craftCategoryIds = craftCategoryIds;
  }
}

class CraftCategoryInfo {
  label: string;
  startCoef: number;
  coef: number;

  constructor(label: string, startCoef: number, coef: number) {
    this.label = label;
    this.startCoef = startCoef;
    this.coef = coef;
  }
}

const jobs: Map<string, JobInfo> = new Map([
  ['alchimiste', new JobInfo('Alchimiste',
    ['essence-gardien-donjon', 'materiel-alchimie', 'poudre', 'potion',
      'potion-oubli-percepteur', 'potion-conquete', 'potion-familier',
      'potion-forgemagie', 'potion-teleportation', 'preparation', 'teinture'])],

  ['bijoutier', new JobInfo('Bijoutier',
    ['bijou'])],

  ['bricoleur', new JobInfo('Bricoleur',
    ['clef-bricoleur', 'filet-capture', 'harnachement', 'objet-elevage', 'prisme',
      'ressources-diverses'])],

  ['bucheron', new JobInfo('Bûcheron',
    ['planche', 'substrat'])],

  ['chasseur', new JobInfo('Chasseur',
    ['clef-chasseur', 'viande-comestible'])],

  ['cordonnier', new JobInfo('Cordonnier',
    ['bottes', 'ceinture'])],

  ['faconneur', new JobInfo('Façonneur',
    ['bouclier', 'idole', 'trophee'])],

  ['forgeron', new JobInfo('Forgeron',
    ['dague', 'faux', 'hache', 'marteau', 'pelle', 'pioche', 'epee'])],

  ['mineur', new JobInfo('Mineur',
    ['alliage', 'orbe-forgemagie', 'pierre-ame', 'pierre-precieuse', 'gemme'])],

  ['paysan', new JobInfo('Paysan',
    ['friandise', 'friandise-multygely', 'huile', 'pain'])],

  ['pecheur', new JobInfo('Pêcheur',
    ['jus-poisson', 'poisson-comestible'])],

  ['sculpteur', new JobInfo('Sculpteur',
    ['arc', 'baguette', 'baton'])],

  ['tailleur', new JobInfo('Tailleur',
    ['cape', 'chapeau', 'costume', 'sac-dos'])]
]);

const craftCategories: Map<string, CraftCategoryInfo> = new Map([
  ['alliage', new CraftCategoryInfo('Alliage', 20, 6)],
  ['arc', new CraftCategoryInfo('Arc', 20, 20)],
  ['baguette', new CraftCategoryInfo('Baguette', 20, 20)],
  ['baton', new CraftCategoryInfo('Bâton', 20, 20)],
  ['bijou', new CraftCategoryInfo('Bijou', 20, 20)],
  ['bottes', new CraftCategoryInfo('Bottes', 20, 20)],
  ['bouclier', new CraftCategoryInfo('Bouclier', 20, 20)],
  ['cape', new CraftCategoryInfo('Cape', 20, 20)],
  ['ceinture', new CraftCategoryInfo('Ceinture', 20, 20)],
  ['chapeau', new CraftCategoryInfo('Chapeau', 20, 20)],
  ['clef-bricoleur', new CraftCategoryInfo('Clef', 30, 4)],
  ['clef-chasseur', new CraftCategoryInfo('Clef', 20, 1)],
  ['costume', new CraftCategoryInfo('Costume', 20, 20)],
  ['dague', new CraftCategoryInfo('Dague', 20, 20)],
  ['epee', new CraftCategoryInfo('Epée', 20, 20)],
  ['essence-gardien-donjon', new CraftCategoryInfo('Essence de gardien de donjon', 20, 4)],
  ['faux', new CraftCategoryInfo('Faux', 20, 20)],
  ['filet-capture', new CraftCategoryInfo('Filet de capture', 20, 4)],
  ['friandise', new CraftCategoryInfo('Friandise', 20, 1)],
  ['friandise-multygely', new CraftCategoryInfo('Friandise (Multygely)', 20, 2)],
  ['gemme', new CraftCategoryInfo('Gemme', 20, 20)],
  ['hache', new CraftCategoryInfo('Hache', 20, 20)],
  ['harnachement', new CraftCategoryInfo('Harnachement', 20, 20)],
  ['huile', new CraftCategoryInfo('Huile', 10, 0.4)],
  ['idole', new CraftCategoryInfo('Idole', 10, 40)],
  ['jus-poisson', new CraftCategoryInfo('Jus de poisson', 40, 40)],
  ['marteau', new CraftCategoryInfo('Marteau', 20, 20)],
  ['materiel-alchimie', new CraftCategoryInfo('Matériel d\'alchimie', 20, 4)],
  ['objet-elevage', new CraftCategoryInfo('Objet d\'élevage', 20, 20)],
  ['orbe-forgemagie', new CraftCategoryInfo('Orbe de forgemagie', 20, 5)],
  ['pain', new CraftCategoryInfo('Pain', 20, 1)],
  ['pelle', new CraftCategoryInfo('Pelle', 20, 20)],
  ['pierre-ame', new CraftCategoryInfo('Pierre d\'âme', 20, 4)],
  ['pierre-precieuse', new CraftCategoryInfo('Pierre précieuse', 20, 2)],
  ['pioche', new CraftCategoryInfo('Pioche', 20, 20)],
  ['planche', new CraftCategoryInfo('Planche', 20, 4)],
  ['poisson-comestible', new CraftCategoryInfo('Poisson comestible', 20, 1)],
  ['potion', new CraftCategoryInfo('Potion', 20, 1)],
  ['potion-conquete', new CraftCategoryInfo('Potion de conquête', 20, 2)],
  ['potion-familier', new CraftCategoryInfo('Potion de familier', 20, 20)],
  ['potion-forgemagie', new CraftCategoryInfo('Potion de forgemagie', 20, 2)],
  ['potion-oubli-percepteur', new CraftCategoryInfo('Potion d\'oubli percepteur', 20, 20)],
  ['potion-teleportation', new CraftCategoryInfo('Potion de téléportation', 20, 4)],
  ['poudre', new CraftCategoryInfo('Poudre', 5, 0.25)],
  ['preparation', new CraftCategoryInfo('Préparation', 20, 1)],
  ['prisme', new CraftCategoryInfo('Prisme', 20, 20)],
  ['ressources-diverses', new CraftCategoryInfo('Ressources diverses', 20, 4)],
  ['sac-dos', new CraftCategoryInfo('Sac à dos', 20, 20)],
  ['substrat', new CraftCategoryInfo('Substrat', 20, 4)],
  ['teinture', new CraftCategoryInfo('Teinture', 20, 2)],
  ['trophee', new CraftCategoryInfo('Trophée', 60, 60)],
  ['viande-comestible', new CraftCategoryInfo('Viande comestible', 20, 2)]
]);

const lvlDiffCoef = [1,
  0.909, 0.823, 0.749, 0.685, 0.63, 0.582, 0.54, 0.504, 0.471, 0.443,
  0.417, 0.394, 0.373, 0.354, 0.337, 0.321, 0.307, 0.294, 0.281, 0.27,
  0.26, 0.25, 0.241, 0.233, 0.225, 0.217, 0.21, 0.204, 0.197, 0.191,
  0.186, 0.181, 0.176, 0.171, 0.167, 0.163, 0.158, 0.154, 0.151, 0.147,
  0.144, 0.141, 0.138, 0.135, 0.132, 0.129, 0.126, 0.124, 0.121, 0.119,
  0.117, 0.115, 0.112, 0.11, 0.108, 0.107, 0.105, 0.103, 0.101, 0.1,
  0.098, 0.096, 0.095, 0.093, 0.092, 0.09, 0.089, 0.088, 0.087, 0.085,
  0.084, 0.083, 0.082, 0.081, 0.08, 0.078, 0.077, 0.076, 0.075, 0.075,
  0.074, 0.072, 0.072, 0.071, 0.07, 0.069, 0.068, 0.067, 0.067, 0.066,
  0.065, 0.064, 0.064, 0.063, 0.062, 0.062, 0.061, 0.06, 0.06, 0.059, 0];

