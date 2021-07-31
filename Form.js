import { Form as FormikForm, Formik, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import SimpleSchema from 'simpl-schema';
import {
  getInitialValues,
  getOnSubmit,
  mapEntries,
  mergeClassNames,
  pickOrOmit,
} from './helpers';
import { defaultDefinitionToComponent } from './defaultDefinitionToComponent';
import { defaultValidate } from './defaultValidate';
import { DebugComponent } from './DebugComponent';
import { ELEMENT_KEY_PREFIX } from './constants';
import { defaultActions } from './defaultActions';
import { defaultParseValue } from './defaultParseValue';
import { defaultStringifyValue } from './defaultStringifyValue';

const FormContext = React.createContext({});
FormContext.displayName = 'FormContext';

export const FormProvider = ({ defaultMessages, children, ...rest }) => {
  // More about this here: https://github.com/aldeed/simpl-schema#customizing-validation-messages
  SimpleSchema.setDefaultMessages(defaultMessages);

  return <FormContext.Provider value={rest}>{children}</FormContext.Provider>;
};

// TODO: Implement this so the initialValues can also be a function
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

const Fields = ({ fieldsComponents, fieldsProps }) => {
  const formikContext = useFormikContext();

  return (
    <>
      {fieldsComponents.map(({ Component, name }) => {
        const className = `${ELEMENT_KEY_PREFIX}-field-${name}`;
        return (
          <Component
            key={className}
            className={className}
            formikContext={formikContext}
            {...(fieldsProps?.[name] || {})}
          />
        );
      })}
    </>
  );
};

const Actions = ({ actions }) => {
  return actions.map((component, index) => {
    const Component = component || 'button';

    return React.isValidElement(Component) ? (
      Component
    ) : (
      <Component key={`${ELEMENT_KEY_PREFIX}-action-${index}`} />
    );
  });
};

export const Form = props => {
  const context = useContext(FormContext);
  const {
    definition,
    omitFields,
    pickFields,
    fieldsProps,
    validate,
    parseValue,
    stringifyValue,
    autoClean = true,
    initialValues = {},
    clipValues = false,

    onSubmit,
    onClick,

    definitionToComponent,
    actions,

    className,
    style,
    isDebug = false,
    ...rest
  } = {
    // I know this is ugly, but all it does is default to context then props,
    // handling cases were we want to merge both instead of just replace
    ...context,
    ...props,

    definitionToComponent:
      props.definitionToComponent ||
      context.definitionToComponent ||
      defaultDefinitionToComponent,
    validate: props.validate || context.validate,
    parseValue: (...args) =>
      props.parseValue?.(...args) ??
      context.parseValue?.(...args) ??
      defaultParseValue(...args),
    stringifyValue: (...args) =>
      props.stringifyValue?.(...args) ??
      context.stringifyValue?.(...args) ??
      defaultStringifyValue(...args),

    actions: [...(context.actions || []), ...(props.actions || defaultActions)],
    className: mergeClassNames(props.className, context.className),
  };

  const simpleSchema = definition?.toSimpleSchema();
  const rawFields = definition?.fields;
  const fields = pickOrOmit(rawFields, pickFields, omitFields);
  const fieldsComponents = Object.entries(fields).map(
    ([name, fieldDefinition]) => ({
      name,
      Component: definitionToComponent({
        name,
        fields,
        fieldDefinition,
      }),
    })
  );

  const formikValidate = values => {
    const validationContext = simpleSchema
      ?.pick(...Object.keys(fields))
      .newContext();
    const cleanedValues =
      simpleSchema && autoClean ? validationContext.clean(values) : values;
    const parsedValues = mapEntries(cleanedValues, ([key, value]) => [
      key,
      parseValue?.(value, fields[key]) || value,
    ]);

    return validate
      ? validate(parsedValues, { simpleSchema, validationContext })
      : defaultValidate(parsedValues, { simpleSchema, validationContext });
  };

  return (
    <Formik
      initialValues={getInitialValues({
        initialValues,
        fields,
        clipValues,
        stringifyValue,
      })}
      onSubmit={getOnSubmit({
        onSubmit,
        simpleSchema,
        autoClean,
        initialValues,
        fields,
        parseValue,
      })}
      validate={formikValidate}
      {...rest}
    >
      <FormikForm className={className} style={style} onClick={onClick}>
        <Fields
          fieldsProps={fieldsProps}
          fieldsComponents={fieldsComponents}
          definitionToComponent={definitionToComponent}
        />
        <Actions actions={actions} initialValues={initialValues} />

        {isDebug && <DebugComponent />}
      </FormikForm>
    </Formik>
  );
};
