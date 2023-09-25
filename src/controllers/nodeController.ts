import { Request, Response } from 'express';
import { NodeService } from '../services/nodeService';
import { v4 as uuidv4 } from 'uuid';

export class NodeController {
    constructor(
        private nodeService: NodeService
    ) {}

    createNode(req: Request, res: Response): void {
        const node = req.body;
        node.id = uuidv4()
        
        this.nodeService.createNode(node)
            .then((createdNode) => {
                res.json(createdNode)
            })
    }

    getNode(req: Request, res: Response): void {
        const nodeId = req.params.id;
        this.nodeService.getNodeById(nodeId)
            .then((node) => {
                if(node === null) {
                    res.status(404).json({ message: 'Node not found' })
                    return
                }
                res.json(node)
            })
    }

    getNodes(req: Request, res: Response): void {
        this.nodeService.getAllNodes()
            .then((nodes) => {
                res.json(nodes)
            })
    }

    updateNode(req: Request, res: Response): void {
        const node = req.body;
        if(node.id !== req.params.id) {
            res.status(404).json({ message: 'Invalid values' });
            return;
        }

        this.nodeService.updateNode(node)
            .then((updatedNode) => {
                if(updatedNode === null) {
                    res.status(404).json({ message: 'Node not found' })
                    return
                }
                res.json(updatedNode)
            })
    }

    deleteNode(req: Request, res: Response): void {
        const nodeId = req.params.id;
        this.nodeService.deleteNodeById(nodeId)
            .then((deletedNode) => {
                if(deletedNode === null) {
                    res.status(404).json({ message: 'Node not found' })
                }
                res.json(true)
            })
    }
}