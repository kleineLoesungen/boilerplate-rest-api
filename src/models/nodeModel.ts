import { Entity, PrimaryColumn, Column } from "typeorm"
import { JoiSchema, getClassSchema } from 'joi-class-decorators';
import * as Joi from 'joi';

/**
 * database, type check and typescript definition of Node. Node is used for example data.
 */
@Entity()
export class Node {
    @PrimaryColumn("uuid")
    @JoiSchema(Joi.string().uuid().required())
    @JoiSchema(['CREATE'], Joi.string().uuid().optional())
    public id!: string
    
    @Column("text")
    @JoiSchema(Joi.string().required())
    public name!: string
    
    @Column("jsonb")
    @JoiSchema(Joi.array().min(0).required())
    public attributes!: {[key: string]: string}[]
}

/**
 * typescript interface definition of NodeInfo. NodeInfo is used for client requests.
 */
export interface NodeInfo {
    id: string,
    name: string
}

export const NodeJoiSchema = getClassSchema(Node);
export const NodeJoiSchemaCreate = getClassSchema(Node, { group: 'CREATE' })