import { TestBed } from '@angular/core/testing';
import { App } from './app';

interface AppHarness {
  readonly answerPadDisabled: () => boolean;
  readonly choicesCount: () => number;
  readonly fieldTransitionDone: () => void;
  readonly gameOver: () => boolean;
  readonly question: () => { readonly target: number };
  readonly remainingTries: () => number;
  readonly score: () => number;
  readonly chooseAnswer: (answer: number) => void;
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the quiz prompt', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('How many?');
  });

  it('should start with three answer choices', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.answer-button')).toHaveLength(3);
  });

  it('should show OpenMoji credit from the about button', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const aboutButton = compiled.querySelector<HTMLButtonElement>('.about-button');

    aboutButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.about-panel')?.textContent).toContain('OpenMoji');
  });

  it('should increase difficulty after three correct answers', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as AppHarness;

    app.chooseAnswer(app.question().target);
    completeFieldTransition(app);
    app.chooseAnswer(app.question().target);
    completeFieldTransition(app);
    app.chooseAnswer(app.question().target);
    completeFieldTransition(app);

    expect(app.score()).toBe(3);
    expect(app.choicesCount()).toBe(4);
  });

  it('should disable answers while transitioning between rounds', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as AppHarness;

    expect(app.answerPadDisabled()).toBe(false);

    app.chooseAnswer(app.question().target);

    expect(app.answerPadDisabled()).toBe(true);

    app.fieldTransitionDone();
    expect(app.answerPadDisabled()).toBe(true);

    app.fieldTransitionDone();
    expect(app.answerPadDisabled()).toBe(false);
  });

  it('should end after three wrong answers', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as AppHarness;
    const wrongAnswer = app.question().target === 0 ? 1 : 0;

    app.chooseAnswer(wrongAnswer);
    app.chooseAnswer(wrongAnswer);
    app.chooseAnswer(wrongAnswer);

    expect(app.remainingTries()).toBe(0);
    expect(app.gameOver()).toBe(true);
  });

  it('should reset wrong tries after a correct answer', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as AppHarness;
    const wrongAnswer = app.question().target === 0 ? 1 : 0;

    app.chooseAnswer(wrongAnswer);
    expect(app.remainingTries()).toBe(2);

    app.chooseAnswer(app.question().target);

    expect(app.remainingTries()).toBe(3);
    expect(app.gameOver()).toBe(false);
  });
});

function completeFieldTransition(app: AppHarness): void {
  app.fieldTransitionDone();
  app.fieldTransitionDone();
}
