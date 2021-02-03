import { Field, Form as FormikForm, Formik, useFormikContext } from 'formik';
import React, { createElement } from 'react';
import SimpleSchema from 'simpl-schema';

const defaultStyles = {
  form: {
    padding: '1em',
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  },
  fieldContainer: {
    gridColumn: '1/-1',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  buttonsContainer: {
    marginTop: '1em',
    gridColumn: '1/-1',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
    justifyContent: 'flex-end',
  },
};

// Get's the field name and definition and returns a formik compatible field
const defaultDefinitionToComponent = (fieldDefinition, name) => {
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

const DefaultButtonComponent = props => <button {...props} />;

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

const getOnSubmit = (
  onSubmit,
  simpleSchema,
  autoClean,
  initialValues
) => rawValues => {
  // We want to use clean to do conversions (e.g. date strings to Date), but
  // keep excess values passed
  const values = {
    ...initialValues,
    ...(simpleSchema && autoClean ? simpleSchema.clean(rawValues) : rawValues),
  };

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

const Buttons = ({
  initialValues,
  actionButtons,
  buttonComponent: ButtonComponent,
  style,
  className,
  submitLabel,
}) => {
  const context = useFormikContext();

  return (
    <div
      style={{ ...defaultStyles.buttonsContainer, ...style }}
      className={className}
    >
      {actionButtons.map(({ label, handler, shouldBeVisible, ...props }) => {
        const values = { ...initialValues, ...context.values };

        if (shouldBeVisible && !shouldBeVisible(values)) {
          return null;
        }

        return typeof ButtonComponent === 'object' ? (
          ButtonComponent
        ) : (
          <ButtonComponent
            key={`quaveform-action-${label}`}
            onClick={e => {
              e.preventDefault();
              handler(values, e);
            }}
            {...props}
          >
            {label}
          </ButtonComponent>
        );
      })}

      {typeof ButtonComponent === 'object' ? (
        ButtonComponent
      ) : (
        <ButtonComponent type="submit">{submitLabel}</ButtonComponent>
      )}
    </div>
  );
};

/**
 * Create a form automatically passing it's definition.
 * @param initialValues
 * @param definition
 * @param fields
 * @param onSubmit
 * @param onClick
 * @param submitLabel
 * @param definitionToComponent
 * @param buttonComponent
 * @param actionButtons
 * @param validate
 * @param autoValidate
 * @param autoClean
 * @param style
 * @param className
 * @param fieldContainerStyle
 * @param fieldContainerClassName
 * @param buttonsContainerStyle
 * @param buttonsContainerClassName
 * @param isDebug
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const Form = ({
  initialValues = {},
  definition,
  fields: fieldsInput,
  onSubmit,
  onClick,
  submitLabel = 'SUBMIT',
  definitionToComponent = defaultDefinitionToComponent,
  buttonComponent = DefaultButtonComponent,
  actionButtons = [],
  validate,
  autoValidate = false,
  autoClean = true,
  style,
  className,
  fieldContainerStyle,
  fieldContainerClassName,
  buttonsContainerStyle,
  buttonsContainerClassName,
  isDebug = false,
  ...props
}) => {
  const simpleSchema = definition?.toSimpleSchema();

  const fields = definition?.fields || fieldsInput;

  return (
    <Formik
      initialValues={getInitialValues(initialValues, fields)}
      onSubmit={getOnSubmit(onSubmit, simpleSchema, autoClean, initialValues)}
      validate={
        autoValidate && simpleSchema ? defaultValidate(simpleSchema) : validate
      }
      {...props}
    >
      <FormikForm
        style={{ ...defaultStyles.form, ...style }}
        className={className}
        onClick={onClick}
      >
        {Object.entries(fields).map(([name, fieldDefinition]) => {
          // If you capitalize the first letter you can just <Component />
          const Component =
            definitionToComponent(fieldDefinition, name) ||
            defaultDefinitionToComponent(fieldDefinition, name);

          return (
            <div
              key={`quaveform-${name}`}
              style={{
                ...defaultStyles.fieldContainer,
                ...fieldContainerStyle,
              }}
              className={fieldContainerClassName}
            >
              {typeof Component === 'object' ? (
                Component
              ) : (
                <Component
                  key={`quaveform-${name}`}
                  name={name}
                  label={fieldDefinition.label}
                />
              )}
            </div>
          );
        })}

        <Buttons
          style={buttonsContainerStyle}
          className={buttonsContainerClassName}
          actionButtons={actionButtons}
          buttonComponent={buttonComponent}
          submitLabel={submitLabel}
          initialValues={initialValues}
        />

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
