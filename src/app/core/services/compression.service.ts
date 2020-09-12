import { Injectable } from '@angular/core';

import LZString from 'lz-string';


@Injectable()
export class CompressionService {
  compressString(data: string): string {
    return LZString.compressToUTF16(data);
  }
  compressObject(data: any): string {
    return LZString.compressToUTF16(JSON.stringify(data));
  }

  decompressString(compressed: string): string {
    return LZString.decompressFromUTF16(compressed);
  }
  decompressObject(compressed: string): any {
    return JSON.parse(LZString.decompressFromUTF16(compressed));
  }
}
