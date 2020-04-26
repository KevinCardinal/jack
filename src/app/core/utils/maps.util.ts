import {MapEntry} from '../models/common.model';

export class Maps {

  public static entrySet<K, V>(map: Map<K, V>): MapEntry<K, V>[] {
    return Array.from(map.entries()).map(entry => {
      return {key: entry[0], value: entry[1]};
    });
  }
}
