import { Component, computed, signal } from '@angular/core';
import { AboutSection } from './about/about-section/about-section';
import { AnswerPad } from './answer-pad/answer-pad';
import {
  FieldSize,
  FieldTransitionPhase,
  QuizConfig,
  QuizQuestion,
  QuizState,
  StatusItem,
  VegetableAsset,
  VegetableModel,
} from './models';
import { ShapeField } from './shape-field/shape-field';

const VEGETABLE_ASSETS: readonly VegetableAsset[] = [
  { alt: 'potato', fileName: '1F954.svg' },
  { alt: 'carrot', fileName: '1F955.svg' },
  { alt: 'corn', fileName: '1F33D.svg' },
  { alt: 'hot pepper', fileName: '1F336.svg' },
  { alt: 'bell pepper', fileName: '1FAD1.svg' },
  { alt: 'cucumber', fileName: '1F952.svg' },
  { alt: 'leafy green', fileName: '1F96C.svg' },
  { alt: 'broccoli', fileName: '1F966.svg' },
  { alt: 'garlic', fileName: '1F9C4.svg' },
  { alt: 'onion', fileName: '1F9C5.svg' },
  { alt: 'pea pod', fileName: '1FADB.svg' },
  { alt: 'root vegetable', fileName: '1FADC.svg' },
];

@Component({
  selector: 'app-root',
  imports: [AboutSection, AnswerPad, ShapeField],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private nextQuestionId = 0;

  private readonly config: QuizConfig = {
    correctAnswersPerLevel: 3,
    initialAnswerChoices: 3,
    maxAnswerChoices: 10,
    maxAnswerNumber: 9,
    maxWrongTries: 3,
    shapeFieldSize: {
      columns: 3,
      rows: 3,
    },
  };

  private readonly quizState = signal<QuizState>(this.createInitialState());
  protected readonly aboutOpen = signal(false);
  protected readonly fieldPhase = signal<FieldTransitionPhase>('idle');

  protected readonly answerPadDisabled = computed(() => this.fieldPhase() !== 'idle');
  protected readonly gameOver = computed(() => this.quizState().status === 'finished');
  protected readonly lastWrongAnswer = computed(() => this.quizState().lastWrongAnswer);
  protected readonly question = computed(() => this.quizState().question);
  protected readonly remainingTries = computed(
    () => this.config.maxWrongTries - this.quizState().wrongTries,
  );
  protected readonly score = computed(() => this.quizState().correctAnswers);
  protected readonly choicesCount = computed(() => this.answerChoiceCountForScore(this.score()));
  protected readonly maxAnswerNumber = this.effectiveMaxAnswerNumber();
  protected readonly shapeFieldSize: FieldSize = this.config.shapeFieldSize;
  protected readonly feedbackMessage = computed(() => {
    if (this.fieldPhase() === 'harvesting') {
      return 'Great job.';
    }

    if (this.fieldPhase() === 'planting') {
      return 'Next round.';
    }

    if (this.lastWrongAnswer() === null) {
      return 'Choose a number.';
    }

    return this.remainingTries() > 0 ? 'Try again.' : 'No tries left.';
  });
  protected readonly vegetables = computed(() => this.createVegetables(this.question()));
  protected readonly statusItems = computed<readonly StatusItem[]>(() => [
    { label: 'Score', value: `${this.score()}` },
    { label: 'Tries', value: `${this.remainingTries()}` },
    { label: 'Choices', value: `${this.choicesCount()}` },
  ]);

  protected closeAbout(): void {
    this.aboutOpen.set(false);
  }

  protected chooseAnswer(answer: number): void {
    const state = this.quizState();

    if (state.status === 'finished' || this.answerPadDisabled()) {
      return;
    }

    if (answer === state.question.target) {
      const correctAnswers = state.correctAnswers + 1;

      this.quizState.set({
        ...state,
        correctAnswers,
        lastWrongAnswer: null,
        wrongTries: 0,
      });
      this.fieldPhase.set('harvesting');
      return;
    }

    const wrongTries = state.wrongTries + 1;

    this.quizState.set({
      ...state,
      lastWrongAnswer: answer,
      status: wrongTries >= this.config.maxWrongTries ? 'finished' : 'playing',
      wrongTries,
    });
  }

  protected restart(): void {
    this.quizState.set(this.createInitialState());
    this.fieldPhase.set('idle');
  }

  protected toggleAbout(): void {
    this.aboutOpen.update((open) => !open);
  }

  protected fieldTransitionDone(): void {
    const phase = this.fieldPhase();

    if (phase === 'harvesting') {
      this.quizState.update((state) => ({
        ...state,
        question: this.createQuestion(),
      }));
      this.fieldPhase.set('planting');
      return;
    }

    if (phase === 'planting') {
      this.fieldPhase.set('idle');
    }
  }

  private answerChoiceCountForScore(correctAnswers: number): number {
    const levelSize = Math.max(1, this.config.correctAnswersPerLevel);
    const earnedLevels = Math.floor(correctAnswers / levelSize);

    return Math.min(
      this.config.maxAnswerChoices,
      this.effectiveMaxAnswerNumber() + 1,
      this.config.initialAnswerChoices + earnedLevels,
    );
  }

  private createInitialState(): QuizState {
    return {
      correctAnswers: 0,
      lastWrongAnswer: null,
      question: this.createQuestion(),
      status: 'playing',
      wrongTries: 0,
    };
  }

  private createQuestion(): QuizQuestion {
    const target = this.randomNumber(this.effectiveMaxAnswerNumber());

    this.nextQuestionId += 1;

    return {
      id: this.nextQuestionId,
      target,
    };
  }

  private createVegetables(question: QuizQuestion): readonly VegetableModel[] {
    return Array.from({ length: question.target }, (_, index) => ({
      ...this.vegetableAssetFor(index, question.target),
      id: `${question.id}-${index}`,
      rotation: `${((index % 5) - 2) * 7}deg`,
      scale: `${1 + ((index + question.target) % 3) * 0.04}`,
    }));
  }

  private effectiveMaxAnswerNumber(): number {
    return Math.min(
      Math.max(0, Math.floor(this.config.maxAnswerNumber)),
      this.shapeFieldCapacity(),
    );
  }

  private normalizeGridSize(value: number): number {
    return Math.max(1, Math.floor(value));
  }

  private randomNumber(maxNumber: number): number {
    return Math.floor(Math.random() * (maxNumber + 1));
  }

  private shapeFieldCapacity(): number {
    return (
      this.normalizeGridSize(this.config.shapeFieldSize.columns) *
      this.normalizeGridSize(this.config.shapeFieldSize.rows)
    );
  }

  private vegetableAssetFor(index: number, target: number): Pick<VegetableModel, 'alt' | 'src'> {
    const asset = VEGETABLE_ASSETS[(index + target) % VEGETABLE_ASSETS.length];

    return {
      alt: asset.alt,
      src: `/openmoji/vegetables/${asset.fileName}`,
    };
  }
}
