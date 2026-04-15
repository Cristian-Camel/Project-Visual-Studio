export type ThemeId = 'aurora' | 'corporate' | 'midnight';
export type TransitionType = 'fade' | 'slide' | 'zoom';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ChartDatum {
  label: string;
  value: number;
}

export type SlideElementType =
  | 'title'
  | 'text'
  | 'image'
  | 'video'
  | 'cta'
  | 'cards'
  | 'list'
  | 'stats'
  | 'chart'
  | 'comparison'
  | 'timeline'
  | 'columns';

export interface BaseElement {
  id: string;
  type: SlideElementType;
  position: Position;
  hidden?: boolean;
  animation?: 'none' | 'fade' | 'slide-up' | 'scale';
  content: Record<string, unknown>;
}

export interface SlideBackground {
  mode: 'color' | 'gradient' | 'image';
  value: string;
}

export interface Slide {
  id: string;
  title: string;
  transition: TransitionType;
  background: SlideBackground;
  elements: BaseElement[];
}

export interface Presentation {
  id: string;
  name: string;
  description: string;
  themeId: ThemeId;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  fontFamily: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}
