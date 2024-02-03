/* eslint-disable fleek-custom/no-interface */
import SchemaBuilder, {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  InputFieldRef,
  InputShapeFromFields,
  MaybePromise,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import { GraphQLResolveInfo } from 'graphql';

import type { PothosWithInputPlugin } from './plugin';

SchemaBuilder.allowPluginReRegistration = true;

const paginate = <TA, TB, TOutput>(a: TA, b: TB) => ({}) as TOutput;

type PartialArgs<Args, ArgRequired, Key extends string> = Args extends undefined
  ? object
  : {
      [key in Key]: InputFieldRef<
        InputShapeFromFields<Args & NonNullable<unknown>> | (true extends ArgRequired ? never : null | undefined)
      >;
    };

type PaginationArgs<PaginationFlag> = PaginationFlag extends true
  ? { pagination?: InputFieldRef<{ take: number; page?: number }> }
  : NonNullable<unknown>;

type FieldWithPaginationOptionsFromKind<
  Types extends SchemaTypes,
  _ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  Kind extends 'Query' | 'Mutation',
  _ResolveShape,
  ResolveReturnShape,
  PaginationFlag
> = FieldWithPaginationOptionsByKind<Types, Type, Nullable, Args, ResolveReturnShape, PaginationFlag>[Kind];

interface FieldWithPaginationOptionsByKind<
  Types extends SchemaTypes,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  PaginationFlag
> {
  Query: QueryFieldOptions<Types, Type, Nullable, Args, ResolveReturnShape, PaginationFlag>;
  Mutation: MutationFieldOptions<Types, Type, Nullable, Args, ResolveReturnShape, PaginationFlag>;
}

interface QueryFieldOptions<
  Types extends SchemaTypes,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  PaginationFlag
> extends Omit<PothosSchemaTypes.FieldOptions<Types, Types['Root'], Type, Nullable, Args, Types['Root'], ResolveReturnShape>, 'resolve'> {
  resolve: Resolver<Types['Root'], InputShapeFromFields<Args>, Types['Context'], ShapeFromTypeParam<Types, Type, Nullable>, PaginationFlag>;
}

interface MutationFieldOptions<
  Types extends SchemaTypes,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  PaginationFlag
> extends Omit<PothosSchemaTypes.FieldOptions<Types, Types['Root'], Type, Nullable, Args, Types['Root'], ResolveReturnShape>, 'resolve'> {
  resolve: Resolver<Types['Root'], InputShapeFromFields<Args>, Types['Context'], ShapeFromTypeParam<Types, Type, Nullable>, PaginationFlag>;
}

type Resolver<Parent, Args, Context, Type, PaginationFlag> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
  type: Type
) => PaginationFlag extends true
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Type extends readonly any[]
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      MaybePromise<ReturnType<typeof paginate<any, any, Type[number][]>>>
    : never
  : MaybePromise<Type>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      inputGroup: PothosWithInputPlugin<Types>;
    }

    export interface RootFieldBuilder<Types extends SchemaTypes, ParentShape, Kind extends FieldKind = FieldKind> {
      input: InputFieldBuilder<Types, 'InputObject'>;
      fieldWithInputGroup: <
        WhereArgs extends Record<string, InputFieldRef<unknown, 'InputObject'>> | undefined,
        DataArgs extends Record<string, InputFieldRef<unknown, 'InputObject'>> | undefined,
        PaginationFlag extends boolean,
        Type extends TypeParam<Types>,
        ResolveShape,
        ResolveReturnShape,
        ArgRequired extends boolean,
        Nullable extends FieldNullability<Type> = Types['DefaultFieldNullability']
      >(
        options: Omit<
          FieldWithPaginationOptionsFromKind<
            Types,
            ParentShape,
            Type,
            Nullable,
            PartialArgs<WhereArgs, ArgRequired, 'where'> & PartialArgs<DataArgs, ArgRequired, 'data'> & PaginationArgs<PaginationFlag>,
            Extract<Kind, 'Query' | 'Mutation'>,
            ResolveShape,
            ResolveReturnShape,
            PaginationFlag
          >,
          'args'
        > & { args: { where: WhereArgs; data: DataArgs; pagination: PaginationFlag } }
      ) => FieldRef<ShapeFromTypeParam<Types, Type, Nullable>>;
    }
  }
}
