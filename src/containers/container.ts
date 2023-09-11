import { NodeController } from '../controllers/nodeController';
import { NodeService, NodeServiceImplementation } from '../services/nodeService';

class Container {
    private instances: { [key: string]: any } = {};

    register(key: string, instance: any): void {
        this.instances[key] = instance;
    }

    resolve<T>(key: string): T {
        return this.instances[key];
    }
}

const container = new Container();
container.register('nodeService', new NodeServiceImplementation());
container.register('nodeController', new NodeController(container.resolve<NodeService>('nodeService')));

export default container;