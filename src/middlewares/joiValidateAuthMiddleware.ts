import { Request, Response } from 'express';
import { UserJoiSchema } from "../models/userModel";
import Joi from 'joi';

/**
 * ensurce req.body includes LoginUser values 
 */
export function joiValidateBodyLoginUser(req: Request, res: Response, next: any) {
    const validateUser = UserJoiSchema.validate(req.body)
    if(validateUser.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateUser.error.message })
    }
}

/**
 * ensure req.body.password as string 
 */
export function joiValidateBodyPassword(req: Request, res: Response, next: any) {
    const validatePassword = Joi.string().required().validate(req.body.password)
    if(validatePassword.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validatePassword.error.message })
    }
}

/**
 * ensure req.body.user as string 
 */
export function joiValidateBodyUser(req: Request, res: Response, next: any) {
    const validateUser = Joi.string().required().validate(req.body.user)
    if(validateUser.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateUser.error.message })
    }
}

/**
 * ensure req.body.is_admin as boolean 
 */
export function joiValidateBodyIsAdmin(req: Request, res: Response, next: any) {
    const validateIsAdmin = Joi.boolean().required().validate(req.body.is_admin)
    if(validateIsAdmin.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateIsAdmin.error.message })
    }
}

/**
 * ensure req.body.name as string 
 */
export function joiValidateBodyName(req: Request, res: Response, next: any) {
    const validateName = Joi.string().required().validate(req.body.name)
    if(validateName.error === undefined) {
        next()
    } else {
        res.status(400).json({ error: validateName.error.message })
    }
}