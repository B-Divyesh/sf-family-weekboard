export const LANE_COLORS = ['#087d96', '#b54b23', '#397144', '#7053a0', '#a46909', '#9b3f69', '#496a9c', '#66752a'];

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Person {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface BoardEvent {
  id: string;
  title: string;
  personId: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  notes: string;
  recurrence: Recurrence;
  recurrenceUntil?: string;
  updatedAt: string;
}

export interface BoardSettings {
  boardName: string;
  theme: 'system' | 'light' | 'dark';
}

export interface BoardSnapshot {
  format: 'weekboard';
  version: 1;
  exportedAt: string;
  people: Person[];
  events: BoardEvent[];
  settings: BoardSettings;
}

export const DEFAULT_SETTINGS: BoardSettings = { boardName: 'Our week', theme: 'system' };
