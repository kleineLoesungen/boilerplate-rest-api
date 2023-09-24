import { AppDataSource } from '../databases/postgresDatabase';
import { Node, NodeInfo } from '../models/nodeModel';

const nodeRepository = AppDataSource.getRepository(Node)

export interface NodeService {
    /**
     * create new node in db
     */
    createNode(node: Node): Promise<Node>;
    
    /**
     * get node informations from db
     */
    getNodeById(id: string): Promise<Node | null>;
    
    /**
     * get all nodes with general informations from db
     */
    getAllNodes(): Promise<NodeInfo[]>;
    
    /**
     * update node in db
     */
    updateNode(node: Node): Promise<Node | null>;

    /**
     * delete node in db
     */
    deleteNodeById(id: string): Promise<boolean>;
}

export class NodeServiceImplementation implements NodeService {
    async createNode(node: Node): Promise<Node> {
        const newNode = new Node()
        newNode.id = node.id
        newNode.name = node.name
        newNode.attributes = node.attributes
        await nodeRepository.save(newNode)
        return node;
    }

    async getNodeById(nodeId: string): Promise<Node | null> {
        return await nodeRepository.findOneBy({ id: nodeId });
    }

    async getAllNodes(): Promise<NodeInfo[]> {
        return await nodeRepository.find({
            select: {
                id: true,
                name: true,
            }
        })
    }

    async updateNode(node: Node): Promise<Node | null> {
        const updateNode = await nodeRepository.findOneBy({ id: node.id })
        if(updateNode === null) return null
        
        updateNode.name = node.name
        updateNode.attributes = node.attributes
        await nodeRepository.save(updateNode)

        return node
    }

    async deleteNodeById(nodeId: string): Promise<boolean> {
        const updateNode = await nodeRepository.findOneBy({ id: nodeId })
        if(updateNode === null) return false

        await nodeRepository.remove(updateNode)
        return true
    }
}