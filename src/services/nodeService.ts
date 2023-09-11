import { Node } from '../models/nodeModel';
import { v4 as uuidv4 } from 'uuid';

export interface NodeService {
    createNode(node: Node): Node;
    getNodeById(id: string): Node | undefined;
    getAllNodes(): Node[];
    updateNode(node: Node): Node | undefined;
    deleteNodeById(id: string): boolean;
}

export class NodeServiceImplementation implements NodeService {
    private nodes: Node[] = [];

    createNode(node: Node): Node {
        node.id = uuidv4();
        this.nodes.push(node);
        return node;
    }

    getNodeById(id: string): Node | undefined {
        return this.nodes.find(node => node.id === id);
    }

    getAllNodes(): Node[] {
        return this.nodes;
    }

    updateNode(node: Node): Node | undefined {
        const indexNode = this.nodes.findIndex(n => n.id === node.id);
        if (indexNode > -1) {
            this.nodes[indexNode] = node;
            return this.nodes[indexNode];
        } else {
            return undefined;
        }
    }

    deleteNodeById(id: string): boolean {
        const nodeIndex = this.nodes.findIndex(node => node.id === id);
        if(nodeIndex !== -1) {
            this.nodes.splice(nodeIndex, 1);
            return true;
        } else {
            return false;
        }
    }
}