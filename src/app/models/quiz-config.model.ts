import { FieldSize } from './field-size.model';

export interface QuizConfig {
  readonly correctAnswersPerLevel: number;
  readonly initialAnswerChoices: number;
  readonly maxAnswerChoices: number;
  readonly maxAnswerNumber: number;
  readonly maxWrongTries: number;
  readonly shapeFieldSize: FieldSize;
}
