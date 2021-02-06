/* eslint-disable react/destructuring-assignment */
import { Field, Form as FormikForm, Formik, useFormikContext } from 'formik';
import React, { useContext } from 'react';
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

const defaultValidate = (simpleSchema, fields) => values => {
  const validationContext = simpleSchema
    .pick(...Object.keys(fields))
    .newContext();

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

const getOnSubmit = (
  onSubmit,
  simpleSchema,
  autoClean,
  initialValues,
  formikContext,
  autoUpdateIsSubmitting
) => async (rawValues, actions) => {
  // We want to use clean to do conversions (e.g. date strings to Date), but
  // keep excess values passed
  const values = {
    ...initialValues,
    ...(simpleSchema && autoClean ? simpleSchema.clean(rawValues) : rawValues),
  };

  await (onSubmit
    ? onSubmit(values, actions)
    : defaultOnSubmit(values, actions));

  if (autoUpdateIsSubmitting) {
    formikContext.setSubmitting(false);
  }
};

const DebugComponent = () => {
  const formikContext = useFormikContext();

  return (
    <pre
      style={{
        textAlign: 'left',
        backgroundColor: '#eee',
        padding: '1em',
        gridColumn: '1/-1',
        overflowX: 'scroll',
        color: '#000',
      }}
    >
      <code>{JSON.stringify(formikContext, null, 2)}</code>
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
  submitDisabled,
}) => {
  const rawFormikContext = useFormikContext();
  const formikContext = {
    ...rawFormikContext,
    values: { ...initialValues, ...rawFormikContext.values },
  };

  return (
    <div
      style={
        className ? undefined : { ...defaultStyles.actionsContainer, ...style }
      }
      className={className}
    >
      {actions.map(
        ({ label, handler, shouldRender, disabled, component, ...props }) => {
          const Component = component || SubmitComponent;

          if (shouldRender && !shouldRender(formikContext)) {
            return null;
          }

          return React.isValidElement(Component) ? (
            Component
          ) : (
            <Component
              key={`quaveform-action-${label}`}
              onClick={e => {
                e.preventDefault();
                handler(formikContext, e);
              }}
              disabled={
                typeof disabled === 'function'
                  ? disabled(formikContext)
                  : disabled
              }
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
          <SubmitComponent
            type="submit"
            disabled={
              formikContext.isSubmitting ||
              (typeof submitDisabled === 'function'
                ? submitDisabled(formikContext)
                : submitDisabled)
            }
          >
            {submitLabel}
          </SubmitComponent>
        ))}
    </div>
  );
};

const FormContext = React.createContext({});
FormContext.displayName = 'FormContext';

/**
 * Provider to set default values to all forms that are children of it
 * @param definitionToComponent
 * @param fieldContainerStyle
 * @param fieldContainerClassName
 * @param actionsContainerStyle
 * @param actionsContainerClassName
 * @param isDebug
 * @param className
 * @param style
 * @param submitLabel
 * @param submitDisabled
 * @param autoUpdateIsSubmitting
 * @param submitComponent
 * @param actions
 * @param validate
 * @param autoValidate
 * @param autoClean
 * @returns {JSX.Element}
 * @constructor
 */
export const FormProvider = ({
  definitionToComponent,
  fieldContainerStyle,
  fieldContainerClassName,
  actionsContainerStyle,
  actionsContainerClassName,
  isDebug = false,
  className,
  style,
  submitLabel,
  submitDisabled,
  autoUpdateIsSubmitting,
  submitComponent,
  actions,
  validate,
  autoValidate,
  autoClean,
  defaultMessages = {},
  children,
}) => {
  // More about this here: https://github.com/aldeed/simpl-schema#customizing-validation-messages
  SimpleSchema.setDefaultMessages(defaultMessages);

  return (
    <FormContext.Provider
      value={{
        definitionToComponent,
        fieldContainerStyle,
        fieldContainerClassName,
        actionsContainerStyle,
        actionsContainerClassName,
        isDebug,
        className,
        style,
        submitLabel,
        submitDisabled,
        autoUpdateIsSubmitting,
        submitComponent,
        actions,
        validate,
        autoValidate,
        autoClean,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

const mergeClassNames = (...args) => args.filter(Boolean).join(' ');

const pickOrOmit = (rawFields, pickFields, omitFields) => {
  if (pickFields?.length) {
    return pickFields.reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]: rawFields[fieldName],
      }),
      {}
    );
  }

  if (omitFields?.length) {
    const mutatedFields = { ...rawFields };
    omitFields.forEach(fieldName => {
      delete mutatedFields[fieldName];
    });
    return mutatedFields;
  }

  return rawFields;
};

/**
 * Create a form automatically passing it's definition.
 * @param initialValues
 * @param definition
 * @param fields
 * @param omitFields
 * @param pickFields
 * @param onSubmit
 * @param autoUpdateIsSubmitting
 * @param onClick
 * @param submitLabel
 * @param submitDisabled
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
export const Form = props => {
  const context = useContext(FormContext);
  const {
    initialValues = {},
    definition,
    fields: fieldsInput,
    omitFields,
    pickFields,
    onSubmit,
    autoUpdateIsSubmitting = false,
    onClick,
    submitLabel = 'SUBMIT',
    submitDisabled = false,
    hideSubmit = false,
    definitionToComponent,
    submitComponent = DefaultSubmitComponent,
    actions = [],
    validate,
    autoValidate = true,
    autoClean = true,
    style,
    className,
    fieldContainerStyle,
    fieldContainerClassName,
    actionsContainerStyle,
    actionsContainerClassName,
    isDebug = false,
    ...rest
  } = {
    // I know this is ugly, but all it does is default to context then props,
    // handling cases were we want to merge both instead of just replace
    ...context,
    ...props,

    definitionToComponent: (...args) =>
      props.definitionToComponent?.(...args) ||
      context.definitionToComponent?.(...args) ||
      defaultDefinitionToComponent(...args),
    validate: (...args) =>
      props.validate?.(...args) || context.validate?.(...args),

    className: mergeClassNames(context.className, props.className),
    fieldContainerClassName: mergeClassNames(
      context.fieldContainerClassName,
      props.fieldContainerClassName
    ),
    actionsContainerClassName: mergeClassNames(
      context.actionsContainerClassName,
      props.actionsContainerClassName
    ),
  };

  const simpleSchema = definition?.toSimpleSchema();
  const rawFields = definition?.fields || fieldsInput;
  const fields = pickOrOmit(rawFields, pickFields, omitFields);

  return (
    <Formik
      initialValues={getInitialValues(initialValues, rawFields)}
      onSubmit={getOnSubmit(
        onSubmit,
        simpleSchema,
        autoClean,
        initialValues,
        context,
        autoUpdateIsSubmitting
      )}
      validate={
        autoValidate && simpleSchema
          ? defaultValidate(simpleSchema, fields)
          : validate
      }
      {...rest}
    >
      <FormikForm
        style={className ? undefined : { ...defaultStyles.form, ...style }}
        className={className}
        onClick={onClick}
      >
        {Object.entries(fields).map(([name, fieldDefinition]) => {
          const Component = definitionToComponent(fieldDefinition, name);

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
          submitDisabled={submitDisabled}
        />

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
