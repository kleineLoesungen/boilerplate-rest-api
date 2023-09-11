import { Request, Response } from 'express';
import { NodeService } from '../services/nodeService';

export class NodeController {
    constructor(
        private nodeService: NodeService
    ) {}

    createNode(req: Request, res: Response): void {
        const node = req.body;
        const createdNode = this.nodeService.createNode(node);
        res.json(createdNode);
    }

    getNode(req: Request, res: Response): void {
        const nodeId = req.params.id;
        const node = this.nodeService.getNodeById(nodeId);

        if (node) {
            res.json(node);
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    }

    getNodes(req: Request, res: Response): void {
        res.json(this.nodeService.getAllNodes());
    }

    updateNode(req: Request, res: Response): void {
        const node = req.body;
        if(node.id !== req.params.id) {
            res.status(404).json({ message: 'Invalid values' });
            return;
        }
        const updatedNode = this.nodeService.updateNode(node);

        if(updatedNode) {
            res.json(updatedNode);
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    }

    deleteNode(req: Request, res: Response): void {
        const nodeId = req.params.id;
        const deletedNode = this.nodeService.deleteNodeById(nodeId)

        if(deletedNode) {
            res.json(true);
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    }
}