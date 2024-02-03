import { InputFieldBuilder, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { upperCaseFirst } from 'upper-case-first';

import { usePaginationBuilder } from './usePaginationBuilder';

const rootBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<SchemaTypes, unknown>;

rootBuilderProto.fieldWithInputGroup = function ({ args: { where, data, pagination }, ...fieldOptions }) {
  const whereInputRef = where ? this.builder.inputRef(upperCaseFirst(`${this.typename}WhereInput`)) : null;
  const dataInputRef = data ? this.builder.inputRef(upperCaseFirst(`${this.typename}DataInput`)) : null;

  const { typeWithAggregationRef, paginationArgsGroup } = pagination
    ? usePaginationBuilder({ builder: this.builder, arg: this.arg, type: fieldOptions.type })
    : { typeWithAggregationRef: null, paginationArgsGroup: {} };

  const whereArgsGroup = whereInputRef
    ? {
        where: this.arg({
          required: true,
          type: whereInputRef,
        }),
      }
    : {};

  const dataArgsGroup = dataInputRef
    ? {
        data: this.arg({
          required: true,
          type: dataInputRef,
        }),
      }
    : {};

  const fieldRef = this.field({
    ...fieldOptions,
    type: typeWithAggregationRef ?? fieldOptions.type,
    args: { ...whereArgsGroup, ...dataArgsGroup, ...paginationArgsGroup },
  } as never);

  this.builder.configStore.onFieldUse(fieldRef, (config) => {
    if (where && whereInputRef) {
      const name = upperCaseFirst(`${config.name}WhereInput`);

      this.builder.inputType(name, {
        fields: () => where,
      });

      this.builder.configStore.associateRefWithName(whereInputRef, name);
    }

    if (data && dataInputRef) {
      const name = upperCaseFirst(`${config.name}DataInput`);

      this.builder.inputType(name, {
        fields: () => data,
      });

      this.builder.configStore.associateRefWithName(dataInputRef, name);
    }
  });

  return fieldRef;
};

rootBuilderProto.fieldWithPagination = function (fieldOptions) {
  const { typeWithAggregationRef, paginationArgsGroup } = usePaginationBuilder({
    builder: this.builder,
    arg: this.arg,
    type: fieldOptions.type,
  });

  return this.field({ ...fieldOptions, type: typeWithAggregationRef, args: { ...paginationArgsGroup } } as never);
};

Object.defineProperty(rootBuilderProto, 'input', {
  get: function getInputBuilder(this: RootFieldBuilder<SchemaTypes, unknown>) {
    return new InputFieldBuilder(this.builder, 'InputObject', `UnnamedWithInputOn${this.typename}`);
  },
});
