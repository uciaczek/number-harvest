import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-answer-pad',
  imports: [],
  templateUrl: './answer-pad.html',
  styleUrl: './answer-pad.scss',
})
export class AnswerPad {
  private lastTouchSelectionAt = 0;

  readonly buttonCount = input.required<number>();
  readonly disabled = input(false);
  readonly lastWrongAnswer = input<number | null>(null);
  readonly maxNumber = input.required<number>();
  readonly questionId = input.required<number>();
  readonly target = input.required<number>();

  readonly answerSelected = output<number>();

  private readonly normalizedMaxNumber = computed(() =>
    Math.max(0, Math.floor(Math.max(this.maxNumber(), this.target()))),
  );

  private readonly normalizedButtonCount = computed(() =>
    Math.min(this.normalizedMaxNumber() + 1, Math.max(1, Math.floor(this.buttonCount()))),
  );

  protected readonly answers = computed(() => {
    this.questionId();

    const maxNumber = this.normalizedMaxNumber();
    const buttonCount = this.normalizedButtonCount();
    const answers = new Set<number>([this.target()]);

    while (answers.size < buttonCount) {
      answers.add(this.randomNumber(maxNumber));
    }

    return this.shuffle([...answers]);
  });

  protected selectAnswer(answer: number): void {
    if (Date.now() - this.lastTouchSelectionAt < 700) {
      return;
    }

    this.emitAnswer(answer);
  }

  protected selectAnswerFromTouch(event: TouchEvent, answer: number): void {
    event.preventDefault();
    this.lastTouchSelectionAt = Date.now();
    this.emitAnswer(answer);
  }

  private emitAnswer(answer: number): void {
    if (this.disabled()) {
      return;
    }

    this.answerSelected.emit(answer);
  }

  private randomNumber(maxNumber: number): number {
    return Math.floor(Math.random() * (maxNumber + 1));
  }

  private shuffle(values: number[]): readonly number[] {
    const shuffled = [...values];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = shuffled[index];
      const replacement = shuffled[swapIndex];

      shuffled[index] = replacement;
      shuffled[swapIndex] = current;
    }

    return shuffled;
  }
}
