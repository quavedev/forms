# quave:forms

Quickly create a form by only passing it's `definition`. The definition object
has to be created using our
[definitions](https://github.com/quavedev/definitions) meteor package. This
package serves *practicity*. If you wish to standardize the forms of your
application or quickly make an admin dashboard, this is the package for you.

## Dependencies

This package has these `npm` depencies. They're not enforced because this could
cause [some problems](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies)
.

* `formik`
* `react`
* `simpl-schema`

Also, it depends on the meteor package `quave:definitions`. Installation
instructions [here](https://github.com/quavedev/definitions#installation).

## Installation

```bash
meteor add quave:forms
```

## Quickstart

Pass a handler to `onSubmit` prop, the initial values to the `initialValues`
prop and a definition to the `definition` prop. *Voilà*! You got yourself a
form.

```javascript
<Form
  onSubmit={handleSubmit}
  initialValues={initialValues}
  definition={PlayerDefinition}
/>
```

The `Form` component can accept any of the properties of the
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
* `autoValidate`: defaults to `false`. Defines if `Form` should try to validate
  the inputs automatically based on the schema. It has some limitations with
  custom objects at the moment. It will work fine for simple definitions.
* `autoClean`: defaults to `true`. Defines if we should call Simple Schema's
  [clean](https://github.com/aldeed/simpl-schema#explicitly-clean-an-object)
  method before passing the values to the `onSubmit` handler.
* `isDebug`: defaults to `false`. When `true`, draws the form state bellow it
  for debugging purposes.
* `fieldContainerStyle`: style passed to a `div` that encloses each field.
* `fieldContainerClassName`: class passed to a `div` that encloses each field.
* `buttonsContainerStyle`: style passed to a `div` that encloses all buttons.
* `buttonsContainerClassName`: class passed to a `div` that encloses all
  buttons.

If you pass `style` or `className`, it will be forwarded to the `form` component,
working as the container for all fields and the buttons' container. Defining any
of the "container" props will discard all our defaults, so you can layout and
style from scratch. If you feel like this should be different feel free to open
an issue, so we can discuss it.

## Layout

If you want to layout your form I recommend using `grid` and `flex` on the
available styles/classNames. This is not yet optimized to be an easy task, but
you can do this once and apply to all your forms. Bellow is an example of how
the props will look in the final HTML document.

```html
<form class="className" style="style">
  <div class="fieldContainerClassName" style="fieldContainerStyle">
    <label>Name</label>
    <input name="name" type="text" label="Name"></div>
  <div class="fieldContainerClassName" style="fieldContainerStyle">
    <label>Birthday</label>
    <input name="birthday" type="text" label="Birthday">
  </div>
  <div class="fieldContainerClassName" style="fieldContainerStyle">
    <label>Position</label>
    <select name="position" label="Position">
      <option value="">Choose one Position</option>
      <option value="GOLEIRO">GOLEIRO</option>
      <option value="LATERAL_DIREITO">LATERAL_DIREITO</option>
      <option value="LATERAL_ESQUERDO">LATERAL_ESQUERDO</option>
      <option value="ZAGUEIRO">ZAGUEIRO</option>
      <option value="VOLANTE">VOLANTE</option>
      <option value="MEIA">MEIA</option>
      <option value="ATACANTE">ATACANTE</option>
      <option value="PONTA_DIREITA">PONTA_DIREITA</option>
      <option value="PONTA_ESQUERDA">PONTA_ESQUERDA</option>
    </select></div>
  <div class="buttonsContainerClassName" style="buttonsContainerStyle">
    <button class="quaveform">ERASE</button>
    <button class="quaveform">CANCEL</button>
    <button class="quaveform-submit-button" type="submit">SAVE</button>
  </div>
</form>
```

### Default Layout

Our default layout is decent (I think). You may take a look at the
`defaultStyles` object at the top of the `Form.js` file.