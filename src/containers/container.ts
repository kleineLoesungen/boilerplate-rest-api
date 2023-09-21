import { NodeController } from '../controllers/nodeController';
import { UserController } from '../controllers/userController';
import { NodeService, NodeServiceImplementation } from '../services/nodeService';
import { SessionService, SessionServiceImplementation } from '../services/sessionService';
import { UserService, UserServiceImplementation } from '../services/userService';

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

container.register('sessionService', new SessionServiceImplementation());
container.register('userService', new UserServiceImplementation());
container.register('userController', new UserController(container.resolve<UserService>('userService'), container.resolve<SessionService>('sessionService')));

export default container;