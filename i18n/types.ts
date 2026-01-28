export type Language = 'en' | 'ur';

export type QuestionUIType =
    | 'yesNo'
    | 'choice'
    | 'multiChoice'
    | 'scale'
    | 'text';

export interface QuestionText {
    label: string;
    options?: string[];
}

export interface QuestionI18n {
    type: QuestionUIType;
    text: Record<Language, QuestionText>;
}
