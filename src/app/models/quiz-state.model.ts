import { QuizQuestion } from './quiz-question.model';
import { QuizStatus } from './quiz-status.model';

export interface QuizState {
  readonly correctAnswers: number;
  readonly lastWrongAnswer: number | null;
  readonly question: QuizQuestion;
  readonly status: QuizStatus;
  readonly wrongTries: number;
}
