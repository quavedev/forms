import { Field, Form as FormikForm, Formik, useFormikContext } from 'formik';
import React from 'react';
import SimpleSchema from 'simpl-schema';

const defaultStyles = {
  form: {
    padding: '1em',
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: '1fr',
  },
  fieldContainer: {
    gridColumn: '1/-1',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
  },
  actionsContainer: {
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

const DefaultSubmitComponent = props => <button {...props} />;

const defaultOnSubmit = values =>
  console.warn('No onSubmit implemented', values);

// Get initial value from defaultValue if it's not present in initialValues
const getInitialValues = (initialValues, fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([name, fieldDefinition]) => [
      name,
      initialValues[name] || fieldDefinition.defaultValue || '',
    ])
  );

const getOnSubmit = (onSubmit, simpleSchema, autoClean, initialValues) => (
  rawValues,
  actions
) => {
  // We want to use clean to do conversions (e.g. date strings to Date), but
  // keep excess values passed
  const values = {
    ...initialValues,
    ...(simpleSchema && autoClean ? simpleSchema.clean(rawValues) : rawValues),
  };

  return onSubmit
    ? onSubmit(values, actions)
    : defaultOnSubmit(values, actions);
};

const DebugComponent = () => {
  const context = useFormikContext();
  console.debug('FORMIK CONTEXT', context);

  return (
    <pre
      style={{
        textAlign: 'left',
        backgroundColor: '#eee',
        padding: '1em',
        gridColumn: '1/-1',
      }}
    >
      <code>{JSON.stringify(context, null, 2)}</code>
    </pre>
  );
};

const Actions = ({
  initialValues,
  actions,
  submitComponent: SubmitComponent,
  style,
  className,
  submitLabel,
  hideSubmit,
}) => {
  const context = useFormikContext();

  return (
    <div
      style={
        className ? undefined : { ...defaultStyles.actionsContainer, ...style }
      }
      className={className}
    >
      {actions.map(
        ({ label, handler, shouldBeVisible, component, ...props }) => {
          const values = { ...initialValues, ...context.values };
          const Component = component || SubmitComponent;

          if (shouldBeVisible && !shouldBeVisible(values)) {
            return null;
          }

          return React.isValidElement(Component) ? (
            Component
          ) : (
            <Component
              key={`quaveform-action-${label}`}
              onClick={e => {
                e.preventDefault();
                handler(values, context, e);
              }}
              {...props}
            >
              {label}
            </Component>
          );
        }
      )}

      {!hideSubmit &&
        (React.isValidElement(SubmitComponent) ? (
          SubmitComponent
        ) : (
          <SubmitComponent type="submit">{submitLabel}</SubmitComponent>
        ))}
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
 * @param submitComponent
 * @param actions
 * @param validate
 * @param autoValidate
 * @param autoClean
 * @param style
 * @param className
 * @param fieldContainerStyle
 * @param fieldContainerClassName
 * @param actionsContainerStyle
 * @param actionsContainerClassName
 * @param isDebug
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const Form = ({
  initialValues = {},
  definition,
  fields: fieldsInput,
  omitFields,
  pickFields,
  onSubmit,
  onClick,
  submitLabel = 'SUBMIT',
  hideSubmit = false,
  definitionToComponent = defaultDefinitionToComponent,
  submitComponent = DefaultSubmitComponent,
  actions = [],
  validate,
  autoValidate = false,
  autoClean = true,
  style,
  className,
  fieldContainerStyle,
  fieldContainerClassName,
  actionsContainerStyle,
  actionsContainerClassName,
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
        style={className ? undefined : { ...defaultStyles.form, ...style }}
        className={className}
        onClick={onClick}
      >
        {(pickFields || Object.keys(fields)).map(name => {
          const fieldDefinition = fields[name];

          if (omitFields && omitFields.includes(name)) {
            return null;
          }

          // If you capitalize the first letter you can just <Component />
          const Component =
            definitionToComponent(fieldDefinition, name) ||
            defaultDefinitionToComponent(fieldDefinition, name);

          return (
            <div
              key={`quaveform-${name}`}
              style={
                fieldContainerClassName
                  ? undefined
                  : {
                      ...defaultStyles.fieldContainer,
                      ...fieldContainerStyle,
                    }
              }
              className={fieldContainerClassName}
            >
              {React.isValidElement(Component) ? (
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

        <Actions
          style={actionsContainerStyle}
          className={actionsContainerClassName}
          actions={actions}
          submitComponent={submitComponent}
          submitLabel={submitLabel}
          initialValues={initialValues}
          hideSubmit={hideSubmit}
        />

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
