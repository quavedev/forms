import { Field, Form, Formik, useFormikContext } from "formik";
import React, { createElement } from "react";
import SimpleSchema from "simpl-schema";

const defaultStyle = {
  formContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "1em",
    justifyContent: "center"
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: "1em"
  },
  label: { width: "100%" },
  field: { width: "100%", boxSizing: "border-box", marginTop: "0.5em" },
  checkboxFieldContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: "1em"
  },
  checkboxField: { boxSizing: "border-box", marginRight: "0.5em" },
  buttonsContainer: {
    alignSelf: "flex-end",
    marginTop: "1em"
  },
  button: {
    marginLeft: "1em"
  }
};

// Get's the field name and definition and returns a formik compatible field
const defaultTypeToComponent = (name, fieldDefinition) => {
  if (fieldDefinition.allowedValues) {
    return props => (
      <>
        <label style={defaultStyle.label}>{props.label}</label>
        <Field style={defaultStyle.field} as="select" {...props}>
          <option value="">Choose one {props.label}</option>
          {fieldDefinition.allowedValues.map(value => (
            <option key={`autoformik-${name}-option-${value}`} value={value}>
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
          <label style={defaultStyle.label}>{props.label}</label>
          <Field style={defaultStyle.field} type="text" {...props} />
        </>
      );
    case Number:
      return props => (
        <>
          <label style={defaultStyle.label}>{props.label}</label>
          <Field style={defaultStyle.field} type="number" {...props} />
        </>
      );
    case SimpleSchema.Integer:
      return props => (
        <>
          <label style={defaultStyle.label}>{props.label}</label>
          <Field style={defaultStyle.field} type="number" step={1} {...props} />
        </>
      );
    case Boolean:
      return props => (
        <div style={defaultStyle.checkboxFieldContainer}>
          <Field
            style={defaultStyle.checkboxField}
            type="checkbox"
            {...props}
          />
          <label style={defaultStyle.label}>{props.label}</label>
        </div>
      );
    case Date:
      return props => (
        <>
          <label style={defaultStyle.label}>{props.label}</label>
          <Field style={defaultStyle.field} type="date" {...props} />
        </>
      );
    default:
      return props => (
        <>
          <label style={defaultStyle.label}>{props.label}</label>
          <Field style={defaultStyle.field} type="text" {...props} />
        </>
      );
  }
};

const defaultValidate = simpleSchema => values => {
  const validationContext = simpleSchema.newContext();

  console.log("VALIDATING: ", values);

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
  console.warn("No onSubmit implemented", values);

// Get initial value from defaultValue if it's not present in initialValues
const getInitialValues = (initialValues, definitionFields) =>
  Object.fromEntries(
    Object.entries(definitionFields).map(([name, fieldDefinition]) => [
      name,
      initialValues[name] || fieldDefinition.defaultValue
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
        textAlign: "left",
        backgroundColor: "#eee",
        padding: "1em"
      }}
    >
      <code>{JSON.stringify(useFormikContext(), null, 2)}</code>
    </pre>
  );
};

export const AutoFormik = ({
  initialValues = {},
  onSubmit,
  definition,
  validate,
  submitLabel = "SUBMIT",
  buttonComponent = defaultButtonComponent,
  typeToComponent = defaultTypeToComponent,
  actionButtons = [],
  autoClean = true,
  autoValidate = false,
  isDebug = false,
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
      <Form className="autoformik-form" style={defaultStyle.formContainer}>
        {Object.entries(definition.fields).map(([name, fieldDefinition]) => {
          const component =
            typeToComponent(name, fieldDefinition) ||
            defaultTypeToComponent(name, fieldDefinition);

          console.log({ component });

          return (
            <div style={defaultStyle.fieldContainer} key={`autoformik-${name}`}>
              {// One might want to pass a rendered component. With this we avoid
              // An unexpected error
              typeof component === "object"
                ? component
                : createElement(component, {
                    key: `autoformik-${name}`,
                    name,
                    label: fieldDefinition.label
                  })}
            </div>
          );
        })}

        <div style={defaultStyle.buttonsContainer}>
          {actionButtons.map(({ label, handler, ...props }) =>
            typeof buttonComponent === "object"
              ? buttonComponent
              : createElement(
                  buttonComponent,
                  {
                    key: `autoformik-action-${label}`,
                    onClick: e => {
                      e.preventDefault();
                      handler(e);
                    },
                    style: defaultStyle.button,
                    className: "autoformik-form",
                    ...props
                  },
                  label
                )
          )}

          {typeof buttonComponent === "object"
            ? buttonComponent
            : createElement(
                buttonComponent,
                {
                  style: defaultStyle.button,
                  className: "autoformik-form-submit-button",
                  type: "submit"
                },
                submitLabel
              )}
        </div>

        {isDebug && <DebugComponent />}
      </Form>
    </Formik>
  );
};
