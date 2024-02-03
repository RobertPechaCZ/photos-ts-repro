import { InputFieldBuilder, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { upperCaseFirst } from 'upper-case-first';

const rootBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<SchemaTypes, unknown>;

rootBuilderProto.fieldWithInputGroup = function fieldWithInputGroup({ args: { where, data, pagination }, ...fieldOptions }) {
  const whereInputRef = where ? this.builder.inputRef(upperCaseFirst(`${this.typename}WhereInput`)) : null;
  const dataInputRef = data ? this.builder.inputRef(upperCaseFirst(`${this.typename}DataInput`)) : null;
  const paginationInputRef = pagination ? this.builder.inputRef(upperCaseFirst(`${this.typename}PaginationInput`)) : null;
  const typeWithAggregationRef = pagination ? this.builder.objectRef(upperCaseFirst(`${this.typename}WithAggregation`)) : null;

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

  const paginationArgsGroup = pagination && paginationInputRef ? { filter: this.arg({ required: false, type: paginationInputRef }) } : {};

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

    if (pagination && typeWithAggregationRef && paginationInputRef) {
      const namePaginationInput = upperCaseFirst(`${config.name}PaginationInput`);

      this.builder.inputType(namePaginationInput, {
        fields: (t) => ({
          take: t.int(),
          page: t.int({ required: false }),
        }),
      });

      this.builder.configStore.associateRefWithName(paginationInputRef, namePaginationInput);

      const nameWithAggregation = upperCaseFirst(`${config.name}WithAggregation`);

      this.builder.simpleObject(nameWithAggregation, {
        fields: (t) => ({
          currentPage: t.field({ type: 'Int' }),
          isFirstPage: t.field({ type: 'Boolean' }),
          isLastPage: t.field({ type: 'Boolean' }),
          previousPage: t.field({ type: 'Int', nullable: true }),
          nextPage: t.field({ type: 'Int', nullable: true }),
          pageCount: t.field({ type: 'Int' }),
          totalCount: t.field({ type: 'Int' }),
          data: t.field({
            type: fieldOptions.type,
          }),
        }),
      });

      this.builder.configStore.associateRefWithName(typeWithAggregationRef, nameWithAggregation);
    }
  });

  return fieldRef;
};

Object.defineProperty(rootBuilderProto, 'input', {
  get: function getInputBuilder(this: RootFieldBuilder<SchemaTypes, unknown>) {
    return new InputFieldBuilder(this.builder, 'InputObject', `UnnamedWithInputOn${this.typename}`);
  },
});