// Get's the field name and definition and returns a formik compatible field
import { Field } from 'formik';
import SimpleSchema from 'simpl-schema';
import React from 'react';
import { ELEMENT_KEY_PREFIX } from './constants';
import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';

const fieldContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '1em',
};

export const defaultDefinitionToComponent = ({ name, fieldDefinition }) => {
  if (fieldDefinition.allowedValues) {
    return ({ formikContext, className, ...props }) => (
      <div style={fieldContainerStyles} className={className}>
        <label>{fieldDefinition.label}</label>
        <Field as="select" name={name} {...props}>
          <option value="">Choose one {fieldDefinition.label}</option>
          {fieldDefinition.allowedValues.map(value => (
            <option
              key={`${ELEMENT_KEY_PREFIX}-field-${name}-option-${value}`}
              value={value}
            >
              {value}
            </option>
          ))}
        </Field>
      </div>
    );
  }

  switch (fieldDefinition.type) {
    case String:
      return ({ formikContext, className, ...props }) => (
        <div style={fieldContainerStyles} className={className}>
          <label>{fieldDefinition.label}</label>
          <Field type="text" name={name} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case Number:
      return ({ formikContext, className, ...props }) => (
        <div style={fieldContainerStyles} className={className}>
          <label>{fieldDefinition.label}</label>
          <Field type="number" name={name} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case SimpleSchema.Integer:
      return ({ formikContext, className, ...props }) => (
        <div style={fieldContainerStyles} className={className}>
          <label>{fieldDefinition.label}</label>
          <Field type="number" step={1} name={name} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case Boolean:
      return ({ formikContext, className, ...props }) => (
        <div
          style={{ ...fieldContainerStyles, display: 'block' }}
          className={className}
        >
          <Field type="checkbox" name={name} {...props} />
          <label>{fieldDefinition.label}</label>
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case DateTimeType:
      return ({ formikContext, className, ...props }) => (
        <div style={fieldContainerStyles} className={className}>
          <label>{fieldDefinition.label}</label>
          <Field type="date" name={name} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    default:
      return ({ formikContext, className, ...props }) => (
        <div style={fieldContainerStyles} className={className}>
          <label>{fieldDefinition.label}</label>
          <Field type="text" name={name} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
  }
};
