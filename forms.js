import { Field, Form as FormikForm, Formik, useFormikContext } from 'formik';
import React, { createElement } from 'react';
import SimpleSchema from 'simpl-schema';

const defaultStyle = {
  formContainer: {
    display: 'grid',
    gridGap: '1em',
  },
};

// Get's the field name and definition and returns a formik compatible field
const defaultTypeToComponent = (name, fieldDefinition) => {
  if (fieldDefinition.allowedValues) {
    return props => (
      <>
        <label>{props.label}</label>
        <Field as="select" {...props}>
          <option value="">Choose one {props.label}</option>
          {fieldDefinition.allowedValues.map(value => (
            <option key={`quaveform-${name}-option-${value}`} value={value}>
              {value}
            </option>
          ))}
        </Field>
      </>
    );
  }

  switch (fieldDefinition.type) {
    case String:
      return props => (
        <>
          <label>{props.label}</label>
          <Field type="text" {...props} />
        </>
      );
    case Number:
      return props => (
        <>
          <label>{props.label}</label>
          <Field type="number" {...props} />
        </>
      );
    case SimpleSchema.Integer:
      return props => (
        <>
          <label>{props.label}</label>
          <Field type="number" step={1} {...props} />
        </>
      );
    case Boolean:
      return props => (
        <div>
          <Field type="checkbox" {...props} />
          <label>{props.label}</label>
        </div>
      );
    case Date:
      return props => (
        <>
          <label>{props.label}</label>
          <Field type="date" {...props} />
        </>
      );
    default:
      return props => (
        <>
          <label>{props.label}</label>
          <Field type="text" {...props} />
        </>
      );
  }
};

const defaultValidate = simpleSchema => values => {
  const validationContext = simpleSchema.newContext();

  const cleanedValues = validationContext.clean(values);
  validationContext.validate(cleanedValues);

  return Object.fromEntries(
    Object.keys(values)
      .map(key => [key, validationContext.keyErrorMessage(key)])
      .filter(([, message]) => Boolean(message))
  );
};

const defaultButtonComponent = props => <button {...props} />;

const defaultOnSubmit = values =>
  console.warn('No onSubmit implemented', values);

// Get initial value from defaultValue if it's not present in initialValues
const getInitialValues = (initialValues, definitionFields) =>
  Object.fromEntries(
    Object.entries(definitionFields).map(([name, fieldDefinition]) => [
      name,
      initialValues[name] || fieldDefinition.defaultValue,
    ])
  );

const getOnSubmit = (onSubmit, simpleSchema, autoClean) => rawValues => {
  const values =
    simpleSchema && autoClean ? simpleSchema.clean(rawValues) : rawValues;

  return onSubmit ? onSubmit(values) : defaultOnSubmit(values);
};

const DebugComponent = () => {
  return (
    <pre
      style={{
        textAlign: 'left',
        backgroundColor: '#eee',
        padding: '1em',
      }}
    >
      <code>{JSON.stringify(useFormikContext(), null, 2)}</code>
    </pre>
  );
};

export const Form = ({
  initialValues = {},
  onSubmit,
  definition,
  validate,
  submitLabel = 'SUBMIT',
  buttonComponent = defaultButtonComponent,
  typeToComponent = defaultTypeToComponent,
  actionButtons = [],
  autoClean = true,
  autoValidate = false,
  isDebug = false,
  formClassName,
  ...props
}) => {
  const simpleSchema = definition.toSimpleSchema();

  return (
    <Formik
      initialValues={getInitialValues(initialValues, definition.fields)}
      onSubmit={getOnSubmit(onSubmit, simpleSchema, autoClean)}
      validate={autoValidate ? defaultValidate(simpleSchema) : validate}
      {...props}
    >
      <FormikForm className={formClassName}>
        {Object.entries(definition.fields).map(([name, fieldDefinition]) => {
          const component =
            typeToComponent(name, fieldDefinition) ||
            defaultTypeToComponent(name, fieldDefinition);

          return (
            <div key={`quaveform-${name}`}>
              {typeof component === 'object'
                ? component
                : createElement(component, {
                    key: `quaveform-${name}`,
                    name,
                    label: fieldDefinition.label,
                  })}
            </div>
          );
        })}

        <div>
          {actionButtons.map(({ label, handler, ...props }) =>
            typeof buttonComponent === 'object'
              ? buttonComponent
              : createElement(
                  buttonComponent,
                  {
                    key: `quaveform-action-${label}`,
                    onClick: e => {
                      e.preventDefault();
                      handler(e);
                    },
                    style: defaultStyle.button,
                    className: 'quaveform',
                    ...props,
                  },
                  label
                )
          )}

          {typeof buttonComponent === 'object'
            ? buttonComponent
            : createElement(
                buttonComponent,
                {
                  style: defaultStyle.button,
                  className: 'quaveform-submit-button',
                  type: 'submit',
                },
                submitLabel
              )}
        </div>

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
