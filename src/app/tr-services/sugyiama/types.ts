import { Node } from 'src/app/tr-interfaces/petri-net/node';

export type LayeredGraph = Node[][];

export enum TraversalDirection {
    Downward = 0,
    Upward = 1,
  }
