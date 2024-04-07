import {type RuntimeValue} from "../types/values";
import type {Token} from "@/programmingLang/types/tokens";
import {LangCompileError} from "@/programmingLang/types/languageError";

export default class Scope {
    parent?: Scope
    variables: Map<string, RuntimeValue>

    constructor(parentScope?: Scope) {
        this.parent = parentScope
        this.variables = new Map()
    }

    declareVariable(identifier: Token, value: RuntimeValue): RuntimeValue {
        if (this.variables.has(identifier.value)) {
            throw new LangCompileError(`Переменная ${identifier.value} уже объявлена`, identifier)
        }

        this.variables.set(identifier.value,value)
        return value
    }

    lookupVariable(identifier: Token): RuntimeValue {
        const env = this.resolve(identifier)
        return env.variables.get(identifier.value) as RuntimeValue
    }

    resolve(identifier: Token): Scope {
        if (this.variables.has(identifier.value)) {
            return this
        }

        if (this.parent == undefined) {
            throw new LangCompileError(`Переменная ${identifier.value} не была объявлена`, identifier)
        }

        return this.parent.resolve(identifier)
    }
}