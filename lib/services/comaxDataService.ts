// Nouveau fichier: lib/services/comaxDataService.ts

import comaxData from '@/data/comax_data.json';

export interface ComaxSpecification {
  Attribute: string;
  W2_min: number;
  W2_max: number;
  W1_min: number;
  W1_max: number;
  Diameter: number;
  E: number;
  Lp: number;
  a: number;
  p: number;
  b: number;
}

export class ComaxDataService {
  private static specifications: ComaxSpecification[] = comaxData.COMAX;

  static getSpecificationByAttribute(attribute: string): ComaxSpecification | undefined {
    return this.specifications.find(spec => spec.Attribute === attribute);
  }

  static getAllAttributes(): string[] {
    return this.specifications.map(spec => spec.Attribute);
  }

  static getAvailableLengths(attribute: string): number[] {
    const spec = this.getSpecificationByAttribute(attribute);
    if (!spec) return [];

    const lengths = [83, 125];
    if (spec.Lp >= 240) {
      lengths.push(240);
    }
    return lengths;
  }

  static validateQuantities(attribute: string, quantities: Record<string, number>): boolean {
    const availableLengths = this.getAvailableLengths(attribute);
    return Object.keys(quantities).every(length => 
      availableLengths.includes(parseInt(length))
    );
  }
}