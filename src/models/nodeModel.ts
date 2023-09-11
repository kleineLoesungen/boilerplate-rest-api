export class Node {
    constructor(
        public id: string, 
        public name: string, 
        public attibutes: {[key: string]: string}[]
    ) {}
}