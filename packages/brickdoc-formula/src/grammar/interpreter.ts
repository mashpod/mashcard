/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-continue */
import { CstElement, CstNode, IToken } from 'chevrotain'
import {
  AnyTypeResult,
  NullResult,
  SpreadsheetResult,
  NumberResult,
  BooleanResult,
  PredicateResult,
  ErrorResult,
  Argument,
  FunctionContext,
  FormulaType,
  ExpressionType,
  BlockResult
} from '../types'
import { extractSubType, parseString, runtimeCheckType, shouldReturnEarly } from './util'
import { buildFunctionKey } from '../functions'
import { BlockClass } from '../controls/block'
import { ParserInstance } from './parser'
import {
  accessOperator,
  additionOperator,
  argumentsOperator,
  arrayOperator,
  chainOperator,
  combineOperator,
  compareOperator,
  concatOperator,
  equalCompareOperator,
  expressionOperator,
  inOperator,
  multiplicationOperator,
  notOperator,
  parenthesisOperator,
  predicateOperator,
  rangeOperator,
  recordFieldOperator,
  recordOperator
} from './operations'
import { interpretByOperator } from './operator'

export interface InterpretArgument {
  readonly type: ExpressionType
  readonly firstArgumentType?: FormulaType
  readonly finalTypes: ExpressionType[]
  skipCheck?: boolean
  lazy?: boolean
  chainArgs?: any
}

const InterpretCstVisitor = ParserInstance.getBaseCstVisitorConstructor<InterpretArgument, Promise<AnyTypeResult>>()

export class FormulaInterpreter extends InterpretCstVisitor {
  ctx: FunctionContext
  lazy: boolean = false

  constructor({ ctx }: { ctx: FunctionContext }) {
    super()
    this.ctx = ctx
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor()
  }

  async startExpression(ctx: { expression: CstNode | CstNode[] }, args: InterpretArgument): Promise<AnyTypeResult> {
    return await this.visit(ctx.expression, args)
  }

  async expression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.Semicolon,
      args,
      operator: expressionOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async combineExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.CombineOperator,
      args,
      operator: combineOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async equalCompareExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.EqualCompareOperator,
      args,
      operator: equalCompareOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async compareExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.CompareOperator,
      args,
      operator: compareOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async inExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.InOperator,
      args,
      operator: inOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async concatExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.Ampersand,
      args,
      operator: concatOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async additionExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.AdditionOperator,
      args,
      operator: additionOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async multiplicationExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.MultiplicationOperator,
      args,
      operator: multiplicationOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async notExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.rhs,
      args,
      operator: notOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async rangeExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.Colon,
      args,
      operator: rangeOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async chainExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.Dot,
      args,
      operator: chainOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async accessExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.LBracket,
      args,
      operator: accessOperator,
      rhs: ctx.rhs,
      lhs: ctx.lhs
    })
  }

  async keyExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    if (ctx.FunctionName) {
      return this.FunctionNameExpression(ctx, args)
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, args)
    } else if (ctx.NumberLiteral) {
      return this.NumberLiteralExpression(ctx, { ...args, skipCheck: true })
    } else {
      throw new Error('Unexpected key expression')
    }
  }

  async simpleAtomicExpression(
    ctx: {
      parenthesisExpression: CstNode | CstNode[]
      arrayExpression: CstNode | CstNode[]
      recordExpression: CstNode | CstNode[]
      constantExpression: CstNode | CstNode[]
      FunctionCall: CstNode | CstNode[]
      lazyVariableExpression: CstNode | CstNode[]
    },
    args: InterpretArgument
  ): Promise<AnyTypeResult> {
    if (ctx.parenthesisExpression) {
      return await this.visit(ctx.parenthesisExpression, args)
    } else if (ctx.arrayExpression) {
      return await this.visit(ctx.arrayExpression, args)
    } else if (ctx.recordExpression) {
      return await this.visit(ctx.recordExpression, args)
    } else if (ctx.constantExpression) {
      return await this.visit(ctx.constantExpression, args)
    } else if (ctx.FunctionCall) {
      return await this.visit(ctx.FunctionCall, args)
    } else if (ctx.lazyVariableExpression) {
      return await this.visit(ctx.lazyVariableExpression, args)
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  async atomicExpression(
    ctx: {
      simpleAtomicExpression: CstNode | CstNode[]
      blockExpression: CstNode | CstNode[]
      referenceExpression: CstNode | CstNode[]
      predicateExpression: CstNode | CstNode[]
    },
    args: InterpretArgument
  ): Promise<AnyTypeResult> {
    if (ctx.simpleAtomicExpression) {
      return await this.visit(ctx.simpleAtomicExpression, args)
    } else if (ctx.referenceExpression) {
      return await this.visit(ctx.referenceExpression, args)
    } else if (ctx.blockExpression) {
      return await this.visit(ctx.blockExpression, args)
    } else if (ctx.predicateExpression) {
      return await this.visit(ctx.predicateExpression, args)
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  async predicateExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    const operators: IToken[] = ctx.EqualCompareOperator ? ctx.EqualCompareOperator : ctx.CompareOperator
    return await interpretByOperator({
      interpreter: this,
      operators,
      args,
      operator: predicateOperator,
      rhs: operators as unknown as CstNode[],
      lhs: ctx.simpleAtomicExpression
    })
  }

  async arrayExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: [],
      args,
      operator: arrayOperator,
      rhs: [],
      lhs: ctx.Arguments
    })
  }

  async recordExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.recordField,
      args,
      operator: recordOperator,
      rhs: ctx.recordField,
      lhs: []
    })
  }

  async recordField(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.Colon,
      args,
      operator: recordFieldOperator,
      rhs: ctx.expression,
      lhs: ctx.keyExpression
    })
  }

  async parenthesisExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: [],
      args,
      operator: parenthesisOperator,
      rhs: [],
      lhs: ctx.expression
    })
  }

  StringLiteralExpression(
    ctx: {
      NumberLiteralExpression?: CstNode | CstNode[]
      BooleanLiteralExpression?: CstNode | CstNode[]
      NullLiteral?: CstNode | CstNode[]
      StringLiteral: any
    },
    args: InterpretArgument
  ): AnyTypeResult {
    const parentType: FormulaType = 'string'
    const typeError = runtimeCheckType(args, parentType, 'StringLiteralExpression', this.ctx)
    if (shouldReturnEarly(typeError)) return typeError!

    const str = ctx.StringLiteral[0].image
    return { result: parseString(str), type: 'string' }
  }

  FunctionNameExpression(ctx: { FunctionName: Array<{ image: any }> }, args: InterpretArgument): AnyTypeResult {
    const parentType: FormulaType = 'string'
    const typeError = runtimeCheckType(args, parentType, 'FunctionNameExpression', this.ctx)
    if (shouldReturnEarly(typeError)) return typeError!

    return { result: ctx.FunctionName[0].image, type: 'string' }
  }

  async constantExpression(
    ctx: {
      NumberLiteralExpression: CstNode | CstNode[]
      BooleanLiteralExpression: CstNode | CstNode[]
      NullLiteral: CstNode | CstNode[]
      StringLiteral: Array<{ image: any }>
    },
    args: InterpretArgument
  ): Promise<AnyTypeResult> {
    if (ctx.NumberLiteralExpression) {
      return await this.visit(ctx.NumberLiteralExpression, args)
    } else if (ctx.BooleanLiteralExpression) {
      return await this.visit(ctx.BooleanLiteralExpression, args)
    } else if (ctx.NullLiteral) {
      const parentType: FormulaType = 'null'
      const typeError = runtimeCheckType(args, parentType, 'constantExpression', this.ctx)
      if (shouldReturnEarly(typeError)) return typeError!

      return { type: 'null', result: null }
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, args)
    } else {
      throw new Error('unsupported expression')
    }
  }

  async blockExpression(
    ctx: any,
    args: InterpretArgument
  ): Promise<NullResult | SpreadsheetResult | BlockResult | ErrorResult> {
    let namespaceId
    if (ctx.UUID) {
      namespaceId = ctx.UUID[0].image
    } else if (ctx.CurrentBlock) {
      namespaceId = this.ctx.meta.namespaceId
    } else {
      throw new Error('unsupported expression')
    }

    const formulaName = this.ctx.formulaContext.findFormulaName(namespaceId)

    if (formulaName?.kind === 'Spreadsheet') {
      const parentType: FormulaType = 'Spreadsheet'
      const typeError = runtimeCheckType(args, parentType, 'blockExpression', this.ctx)
      if (shouldReturnEarly(typeError)) return typeError!

      const spreadsheet = this.ctx.formulaContext.findSpreadsheet(namespaceId)
      if (!spreadsheet) {
        return { type: 'Error', result: `Spreadsheet ${namespaceId} not found`, errorKind: 'runtime' }
      }
      return { type: 'Spreadsheet', result: spreadsheet }
    }

    if (formulaName?.kind === 'Block') {
      const parentType: FormulaType = 'Block'
      const typeError = runtimeCheckType(args, parentType, 'blockExpression', this.ctx)
      if (shouldReturnEarly(typeError)) return typeError!

      const block = new BlockClass(this.ctx.formulaContext, { id: namespaceId })
      return { type: 'Block', result: block }
    }

    return { type: 'null', result: null }
  }

  // TODO runtime type check
  async referenceExpression(
    ctx: { lazyVariableExpression: CstNode | CstNode[] },
    args: InterpretArgument
  ): Promise<AnyTypeResult> {
    return await this.visit(ctx.lazyVariableExpression, { ...args, type: 'any', lazy: true })
  }

  async lazyVariableExpression(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    if (ctx.Self) {
      // TODO runtime type check
      return { type: 'Reference', result: { kind: 'self' } }
    } else if (ctx.LambdaArgumentNumber) {
      // TODO runtime type check
      const number = Number(ctx.LambdaArgumentNumber[0].image.substring(1))
      const result = this.ctx.interpretContext.arguments[number - 1]

      if (result) {
        return result
      }
      return { type: 'Error', result: `Argument ${number} not found`, errorKind: 'runtime' }
    } else if (ctx.Input) {
      const parentType: FormulaType = 'Record'
      const typeError = runtimeCheckType(args, parentType, 'lazyVariableExpression', this.ctx)
      if (shouldReturnEarly(typeError)) return typeError!

      return {
        type: 'Record',
        subType: extractSubType(Object.values(this.ctx.interpretContext.ctx)),
        result: this.ctx.interpretContext.ctx
      }
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  NumberLiteralExpression(
    ctx: { NumberLiteral: Array<{ image: any }>; DecimalLiteral: any; Sign: any; Minus: any },
    args: InterpretArgument
  ): NumberResult | ErrorResult {
    const parentType: FormulaType = 'number'
    const typeError = runtimeCheckType(args, parentType, 'NumberLiteralExpression', this.ctx)
    if (shouldReturnEarly(typeError)) return typeError!

    const image = ctx.DecimalLiteral ? ctx.DecimalLiteral[0].image : ctx.NumberLiteral[0].image
    const number = Number(image)

    const numberAfterSign = ctx.Sign ? number * 0.01 : number

    return { result: ctx.Minus ? numberAfterSign * -1 : numberAfterSign, type: 'number' }
  }

  BooleanLiteralExpression(
    ctx: { BooleanLiteral: Array<{ image: string }> },
    args: InterpretArgument
  ): BooleanResult | ErrorResult {
    const parentType: FormulaType = 'boolean'
    const typeError = runtimeCheckType(args, parentType, 'BooleanLiteralExpression', this.ctx)
    if (shouldReturnEarly(typeError)) return typeError!
    return { result: ['true'].includes(ctx.BooleanLiteral[0].image), type: 'boolean' }
  }

  // eslint-disable-next-line complexity
  async FunctionCall(
    ctx: {
      FunctionName: Array<{ image: any }>
      Arguments: CstNode[]
    },
    args: InterpretArgument
  ): Promise<AnyTypeResult> {
    const chainArgs = args?.chainArgs
    const names = ctx.FunctionName.map(group => group.image)
    const [group, name] = names.length === 1 ? ['core', ...names] : names

    const clause = this.ctx.formulaContext.findFunctionClause(group, name)

    const functionKey = buildFunctionKey(group, name, true)

    if (!clause) {
      throw new Error(`Function ${functionKey} not found`)
    }

    if (clause.feature && !this.ctx.formulaContext.features.includes(clause.feature)) {
      throw new Error(`Feature ${clause.feature} not enabled`)
    }

    const typeError = runtimeCheckType(args, clause.returns, 'FunctionCall', this.ctx)
    if (shouldReturnEarly(typeError)) return typeError!

    let functionArgs: AnyTypeResult[] = []

    if (clause.chain && chainArgs) {
      const firstArgs = clause.args[0]
      const typeError = runtimeCheckType(chainArgs.type, firstArgs.type, 'FunctionCallFirstArg', this.ctx)
      if (shouldReturnEarly(typeError)) return typeError!

      functionArgs.push(chainArgs)
    }

    if (clause.lazy) {
      // TODO runtime type check
      const argsTypes = clause.args.map(arg => arg.type)

      if (!ctx.Arguments || !ctx.Arguments[0].children?.expression) {
        return { type: 'Error', result: 'Function is empty', errorKind: 'runtime' }
      }

      for (const { e, index } of ctx.Arguments[0].children?.expression.map((e: CstElement, index: number) => ({
        e,
        index
      }))) {
        const argType = argsTypes[clause.chain && chainArgs ? index + 1 : index]

        const element = e as CstNode

        if (argType === 'Cst') {
          this.lazy = true
          functionArgs.push({ type: 'Cst', result: element })
        } else {
          functionArgs.push(await this.visit(element, { lazy: argType === 'Reference', type: 'any', finalTypes: [] }))
        }
      }
    } else {
      if (ctx.Arguments) {
        const clauseArguments = clause.chain && chainArgs ? clause.args.slice(1) : clause.args
        const argResult = await this.visit(ctx.Arguments, { ...args, finalTypes: clauseArguments.map(e => e.type) })
        functionArgs.push(...(argResult.result as AnyTypeResult[]))
      }

      const argsTypes: Argument[] = clause.args[0]?.spread
        ? Array(functionArgs.length).fill(clause.args[0])
        : clause.args

      if (!clause.acceptError) {
        const errorArgs = functionArgs.find(a => shouldReturnEarly(a))
        if (errorArgs) {
          return errorArgs as AnyTypeResult
        }
      }

      functionArgs = argsTypes.map((argType, index) => {
        const v = functionArgs[index] || argType.default
        if (!v) {
          throw new Error(`Argument ${index} is not defined`)
        }

        if (argType.type === 'Predicate' && ['number', 'string'].includes(v.type)) {
          return { type: 'Predicate', result: v as PredicateResult['result'], operator: 'equal' }
        } else {
          return v
        }
      })
    }

    return (clause.reference as (ctx: FunctionContext, ...args: any[]) => any)(this.ctx, ...functionArgs)
  }

  async Arguments(ctx: any, args: InterpretArgument): Promise<AnyTypeResult> {
    return await interpretByOperator({
      interpreter: this,
      operators: ctx.expression,
      args,
      operator: argumentsOperator,
      rhs: ctx.expression,
      lhs: []
    })
  }
}
