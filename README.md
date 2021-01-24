# autoformik

Quickly create a form by only passing it's `definition`. The definition object
has to be created using our
[definitions](https://github.com/quavedev/definitions) meteor package. This
package serves *practicity*. If you wish to standardize the forms of your
application or quickly make an admin dashboard, this is the package for you.

## Dependencies

This package has these `npm` depencies. They're not enforced because this could
cause [some problems](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies).

* `formik`
* `react`
* `simpl-schema`

Also, it depends on the meteor package `quave:definitions`. 
Installation instructions [here](https://github.com/quavedev/definitions#installation).

## Installation

```bash
meteor add quave:autoformik
```

## Quickstart

Pass a handler to `onSubmit` prop, the initial values to the `initialValues`
prop and a definition to the `definition` prop. *Voilà*! You got yourself a
form.

```javascript
<AutoFormik
  onSubmit={handleSubmit}
  initialValues={initialValues}
  definition={PlayerDefinition}
/>
```

The `AutoFormik` component can accept any of the properties of the 
[Formik](https://formik.org/docs/api/formik) component, plus these:

* `definition`: object definition from our
  [definitions](https://github.com/quavedev/definitions) package.
* `submitLabel`: defaults to *SUBMIT*. It's used as child of the submit button.
* `buttonComponent`: defaults to `<button />`. The component used for buttons.
  `type="submit"` is passed as prop.
* `typeToComponent`: a function that receives `(name, fieldDefinition)` as 
  arguments and return a
  [Formik compatible](https://formik.org/docs/api/field#component) component to
  be used for that field. `fieldDefinition` is the content of the `fields`
  property of the definition passed as prop (`definition.fields`). 
* `actionButtons`: an array of objects with `label` and `handler` properties.
  `label` will be passed as a child of the button component and `handler` is a
  function to be called when the `onClick` event is triggered. It calls
  `e.preventDefault()` before calling the handler.
* `autoValidate`: defaults to `false`. Defines if `AutoFormik` should try to
  validate the inputs automatically based on the schema. It has some limitations
  with custom objects at the moment. It will work fine for simple definitions.
* `autoClean`: defaults to `true`. Defines if we sohuld call Simple Schema's
  [clean](https://github.com/aldeed/simpl-schema#explicitly-clean-an-object)
  method before passing the fields to the `onSubmit` handler.
* `isDebug`: defaults to `false`. When `true`, draws the form state bellow it
  for debugging purposes.


