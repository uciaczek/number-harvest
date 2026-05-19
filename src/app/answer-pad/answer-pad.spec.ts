import { TestBed } from '@angular/core/testing';
import { AnswerPad } from './answer-pad';

describe('AnswerPad', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerPad],
    }).compileComponents();
  });

  it('should select an answer on touch end without duplicating the follow-up click', () => {
    const fixture = TestBed.createComponent(AnswerPad);
    const selectedAnswers: number[] = [];

    fixture.componentRef.setInput('buttonCount', 1);
    fixture.componentRef.setInput('maxNumber', 2);
    fixture.componentRef.setInput('questionId', 1);
    fixture.componentRef.setInput('target', 2);
    fixture.componentInstance.answerSelected.subscribe((answer) => selectedAnswers.push(answer));
    fixture.detectChanges();

    const answerButton = fixture.nativeElement.querySelector('.answer-button') as HTMLButtonElement;

    answerButton.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }));
    answerButton.click();

    expect(selectedAnswers).toEqual([2]);
  });
});
