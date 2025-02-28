export interface OutlineNode {
  data?: { text: string };
  children?: OutlineNode[] | [];
}

export interface SvgData {
  svg: {
    dom: Record<string, unknown>;
    node: SVGSVGElement;
    type: 'svg' | 'png' | 'pdf' | 'xmind' | 'json' | 'md' | 'txt' | 'smm';
  };
  svgHTML: string;
  clipData: null | Record<string, unknown>;
  rect: {
    cx: number;
    cy: number;
    h: number;
    height: number;
    ratio: number;
    w: number;
    width: number;
    x: number;
    x2: number;
    y: number;
    y2: number;
  };
  origWidth: number;
  origHeight: number;
  scaleX: number;
  scaleY: number;
}
