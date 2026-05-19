import { Component, computed, input, output } from '@angular/core';
import { FieldSize, FieldTransitionPhase, VegetableModel } from '../models';

@Component({
  selector: 'app-shape-field',
  imports: [],
  templateUrl: './shape-field.html',
  styleUrl: './shape-field.scss',
})
export class ShapeField {
  readonly fieldSize = input.required<FieldSize>();
  readonly phase = input<FieldTransitionPhase>('idle');
  readonly vegetables = input.required<readonly VegetableModel[]>();

  readonly transitionDone = output<void>();

  protected readonly columns = computed(() => this.normalizeGridSize(this.fieldSize().columns));
  protected readonly rows = computed(() => this.normalizeGridSize(this.fieldSize().rows));

  private normalizeGridSize(value: number): number {
    return Math.max(1, Math.floor(value));
  }
}
