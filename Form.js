import { Field, Form as FormikForm, Formik, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import SimpleSchema from 'simpl-schema';
import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';

export const defaultActions = [{ label: 'submit', type: 'submit' }];

// Get's the field name and definition and returns a formik compatible field
export const defaultDefinitionToComponent = ({
  fieldDefinition,
  name,
  formikContext,
}) => {
  const fieldContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1em',
  };

  if (fieldDefinition.allowedValues) {
    return props => (
      <div style={fieldContainerStyles}>
        <label>{props.label}</label>
        <Field as="select" {...props}>
          <option value="">Choose one {props.label}</option>
          {fieldDefinition.allowedValues.map(value => (
            <option key={`quaveform-${name}-option-${value}`} value={value}>
              {value}
            </option>
          ))}
        </Field>
      </div>
    );
  }

  switch (fieldDefinition.type) {
    case String:
      return props => (
        <div style={fieldContainerStyles}>
          <label>{props.label}</label>
          <Field type="text" {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case Number:
      return props => (
        <div style={fieldContainerStyles}>
          <label>{props.label}</label>
          <Field type="number" {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case SimpleSchema.Integer:
      return props => (
        <div style={fieldContainerStyles}>
          <label>{props.label}</label>
          <Field type="number" step={1} {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case Boolean:
      return props => (
        <div style={{ ...fieldContainerStyles, display: 'block' }}>
          <Field type="checkbox" {...props} />
          <label>{props.label}</label>
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    case DateTimeType:
      return props => (
        <div style={fieldContainerStyles}>
          <label>{props.label}</label>
          <Field type="date" {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
      );
    default:
      return props => (
        <div style={fieldContainerStyles}>
          <label>{props.label}</label>
          <Field type="text" {...props} />
          <span style={{ color: 'red' }}>{formikContext.errors?.[name]}</span>
        </div>
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

const defaultOnSubmit = values =>
  console.warn('No onSubmit implemented', values);

// Get initial value from defaultValue if it's not present in initialValues
const getInitialValues = (initialValues, fields, clipValues) => ({
  ...(clipValues ? {} : initialValues),
  ...Object.fromEntries(
    Object.entries(fields).map(([name, fieldDefinition]) => [
      name,
      initialValues[name] ?? fieldDefinition.defaultValue ?? '',
    ])
  ),
});

const getOnSubmit = (
  onSubmit,
  simpleSchema,
  autoClean,
  initialValues
) => async (rawValues, actions) => {
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

const Actions = ({ initialValues, actions }) => {
  const rawFormikContext = useFormikContext();
  const formikContext = {
    ...rawFormikContext,
    values: { ...initialValues, ...rawFormikContext.values },
  };

  return (
    <>
      {actions.map(
        ({ label, handler, shouldRender, disabled, component, ...props }) => {
          const Component = component || 'button';

          if (shouldRender && !shouldRender(formikContext)) {
            return null;
          }

          return React.isValidElement(Component) ? (
            Component
          ) : (
            <Component
              key={`quaveform-action-${label}`}
              onClick={event => handler?.(formikContext, event)}
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
    </>
  );
};

const FormContext = React.createContext({});
FormContext.displayName = 'FormContext';

export const FormProvider = ({ defaultMessages, children, ...rest }) => {
  // More about this here: https://github.com/aldeed/simpl-schema#customizing-validation-messages
  SimpleSchema.setDefaultMessages(defaultMessages);

  return <FormContext.Provider value={rest}>{children}</FormContext.Provider>;
};

const mergeClassNames = (...args) => args.filter(Boolean).join(' ');

const pickOrOmit = (rawFields, pickFields, omitFields) => {
  if (pickFields?.length) {
    const picked = pickFields.reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]: rawFields[fieldName] || null,
      }),
      {}
    );
    if (Object.values(picked).includes(null)) {
      throw Error(`Unable to pick value from fields: ${pickFields}`);
    }
    return picked;
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

// const Generate = ({ generate }) => {
//   const formikContext = useFormikContext();
//
//   useEffect(() => {
//     // We have to use an IIFE because we can't return a promise inside useEffect
//     // and I want to accept non async functions as well, so "then" wouldn't work
//     (async () => {
//       const values = await generate();
//       formikContext.setValues({
//         ...formikContext.initialValues,
//         ...formikContext.values,
//         ...values
//       });
//     })();
//   }, []);
//
//   return null;
// };

const Fields = ({ fields, definitionToComponent }) => {
  const formikContext = useFormikContext();

  return (
    <>
      {Object.entries(fields).map(([name, fieldDefinition]) => {
        const Component = definitionToComponent({
          fieldDefinition,
          name,
          formikContext,
        });

        return React.isValidElement(Component) ? (
          Component
        ) : (
          <Component
            key={`quaveform-${name}`}
            name={name}
            label={fieldDefinition.label}
          />
        );
      })}
    </>
  );
};

export const Form = props => {
  const context = useContext(FormContext);
  const {
    definition,
    omitFields,
    pickFields,
    validate,
    autoValidate = true,
    autoClean = true,
    initialValues = {},
    clipValues = false,

    onSubmit,
    onClick,

    definitionToComponent,
    actions,

    className,
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

    actions: [...(context.actions || []), ...(props.actions || defaultActions)],
    className: mergeClassNames(props.className, context.className),
  };

  const simpleSchema = definition?.toSimpleSchema();
  const rawFields = definition?.fields;
  const fields = pickOrOmit(rawFields, pickFields, omitFields);

  return (
    <Formik
      initialValues={getInitialValues(initialValues, fields, clipValues)}
      onSubmit={getOnSubmit(onSubmit, simpleSchema, autoClean, initialValues)}
      validate={
        autoValidate && simpleSchema
          ? defaultValidate(simpleSchema, fields)
          : validate
      }
      {...rest}
    >
      <FormikForm className={className} onClick={onClick}>
        <Fields fields={fields} definitionToComponent={definitionToComponent} />
        <Actions actions={actions} initialValues={initialValues} />

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
