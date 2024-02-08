import { Node } from 'src/app/tr-interfaces/petri-net/node';
import { Arc } from 'src/app/tr-classes/petri-net/arc';
import { Point } from 'src/app/tr-classes/petri-net/point';
import { DummyNode } from 'src/app/tr-classes/petri-net/dummyNode';

import { LayeredGraph, TraversalDirection } from 'src/app/tr-services/sugyiama/types';

export class CoordinateAssignmentService {
    // Initial set of nodes and arcs
    private _arcs: Arc[] = [];
    private _nodes: Node[] = [];
    private _layers: LayeredGraph = [];

    // Map connected nodes for each node
    private _nodeInputMap = new Map();
    private _nodeOutputMap = new Map();
    private _nodeNeighbors: Array<Map<Node, Node[]>> = [];


    private _type1Conflicts: Record<string, Record<string, boolean>> = {};

    constructor(layers: LayeredGraph, arcs: Arc[], nodes: Node[]) {
        this._layers = layers;
        this._arcs = arcs;
        this._nodes = nodes;

        const drawingArea = document.getElementById('drawingArea');

    }

    assignCoordinates() {
        let currentX = 0;
        let currentY = 0;

        this.generateAdjacentNodeMaps();

        // remove all anchorpoints as these will have to be re-calculated
        this._arcs.forEach((arc) => arc.resetAnchors());

        // Preprocessing
        this.markType1Conflicts(this._layers, true);

        console.log(this._layers, this._type1Conflicts);
    }


    private markType1Conflicts(layers: LayeredGraph, downward: boolean) {
        // Iteration bounds
        let upper = layers.length;
        let lower = 1;
        let direction: TraversalDirection;

        if (downward) {
            lower = 1;
            upper = layers.length - 2;
            direction = TraversalDirection.Downward;
        } else {
            lower = layers.length - 1;
            upper = 2; 
            direction = TraversalDirection.Upward;
        }

        let k1: Number; // node position boundaries of closest inner segments

        for (let i = lower; (downward && i <= upper) || (!downward && i >= upper); i = downward ? i + 1 : i - 1) {
            let k0: Number = 0;
            let firstIndex = 0; // index of first node on each layer
            const currentLayer = layers[i];
            const nextLayer = downward ? layers[i+1] : layers[i-1];

            // iterate over all nodes on the next level
            for (let l1 = 0; l1 <= nextLayer.length; l1++) {
                const dummyNeighbor = this.getNextNeighborDummyNode(nextLayer[l1], direction);

                if (l1 === nextLayer.length || dummyNeighbor) {
                    k1 = currentLayer.length;

                    if (dummyNeighbor) {
                        // get index of the neighbor node
                        k1 = this.getIndexOfNodeInLayer(nextLayer, dummyNeighbor);
                    }

                    for (let j = firstIndex; j <= l1; j++) {
                        const nextLevelNeighbors = this.getNeighbors(nextLayer[l1], direction);

                        nextLevelNeighbors.forEach(currentNeighbor => {
                            const neighborIndex = this.getIndexOfNodeInLayer(nextLayer, currentNeighbor);
                            if (neighborIndex < k0 || neighborIndex > k1) {
                                const segmentStart = nextLayer[l1];
                                if (!this._type1Conflicts[segmentStart.id]) this._type1Conflicts[segmentStart.id] = {};
                                this._type1Conflicts[segmentStart.id][currentNeighbor.id] = true;
                            }
                        });

                        firstIndex = j + 1;
                    }

                    k0 = k1;
                }
                
            }

            
        }
    }

    private getNextNeighborDummyNode(node: Node, direction: TraversalDirection): Node | null {
        const neighbors = this._nodeNeighbors[direction].get(node);

        if (node instanceof DummyNode) {
            if (!this.isPartOfLongEdge(node)) return null;

            const neighborNodes = this.getNeighbors(node, direction);
            if (neighborNodes.length === 0) return null;

            if (neighborNodes.length > 1) throw Error("Dummy Nodes should never have more than one neighbor.");

            return neighborNodes[0];
        }

        return null;
    }

    private getNeighbors(node: Node, direction: TraversalDirection): Node[] {
        const neighbors = this._nodeNeighbors[direction].get(node);

        if (!neighbors) return [];

        return neighbors;
    }

    private isPartOfLongEdge(node: DummyNode) {
        const connectedNodes = this.getConnectedNodes(node);
        // if any of the connected nodes is a dummy node, then this one is part of a long edge
        return connectedNodes.some((node) => node instanceof DummyNode)
    }

    private generateAdjacentNodeMaps() {
        this._nodeInputMap.clear();
        this._nodeOutputMap.clear();

        this._arcs.forEach((arc) => {
            if (this._nodeInputMap.get(arc.to)) {
                this._nodeInputMap.get(arc.to)?.push(arc.from);
            } else {
                this._nodeInputMap.set(arc.to, [arc.from]);
            }

            if (this._nodeOutputMap.get(arc.from)) {
                this._nodeOutputMap.get(arc.from)?.push(arc.to);
            } else {
                this._nodeOutputMap.set(arc.from, [arc.to]);
            }
        });

        this._nodeNeighbors[TraversalDirection.Downward] = new Map();
        for (let i = 0; i < this._layers.length; i++) {
            const nextLayer = this._layers[i+1];
            if (nextLayer && nextLayer.length) {
                for (const node of this._layers[i]) {
                    const connectedNodes = this.getConnectedNodes(node);
                    const neighborNodes = connectedNodes.filter((node: Node) => nextLayer.includes(node));
                    this._nodeNeighbors[TraversalDirection.Downward].set(node, neighborNodes);
                }
            }
        }

        this._nodeNeighbors[TraversalDirection.Upward] = new Map();
        for (let i = this._layers.length - 1; i >= 0; i--) {
            const nextLayer = this._layers[i-1];
            if (nextLayer && nextLayer.length) {
                for (const node of this._layers[i]) {
                    const connectedNodes = this.getConnectedNodes(node);
                    const neighborNodes = connectedNodes.filter((node: Node) => nextLayer.includes(node));
                    this._nodeNeighbors[TraversalDirection.Upward].set(node, neighborNodes);
                }
            }
        }
    }

    private getConnectedNodes(node: Node) {
        const connectedNodes = [];

        const inputNodes = this._nodeInputMap.get(node);
        const outputNodes = this._nodeOutputMap.get(node);

        if (inputNodes) connectedNodes.push(...inputNodes);
        if (outputNodes) connectedNodes.push(...outputNodes);

        return connectedNodes;
    }

    private getIndexOfNodeInLayer(layer: Node[], node: Node): Number {
        return layer.indexOf(node);
    }
}
