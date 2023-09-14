import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class Node {
    constructor(id: string, name: string, attributes: {[key: string]: string}[]) {
        this.id = id
        this.name = name
        this.attributes = attributes
    }
    
    @PrimaryColumn("uuid")
    id: string
    
    @Column("text")
    name: string
    
    @Column("jsonb")
    attributes: {[key: string]: string}[]
}