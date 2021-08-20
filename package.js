/* global Package */
Package.describe({
  name: 'quave:forms',
  version: '3.0.4',
  summary: 'Create Formik forms automatically from a quave:definition object.',
  git: 'https://github.com/quavedev/forms',
});

Package.onUse(api => {
  api.versionsFrom('1.10.2');
  api.use('quave:definitions@1.0.0');
  api.use('quave:custom-type-date-time@1.0.1');
  api.use('ecmascript');

  api.addFiles('Form.js', 'client');
});
