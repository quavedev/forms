Package.describe({
  name: 'quave:forms',
  version: '2.0.0',
  summary: 'Create Formik forms automatically from a SimpleSchema object.',
  git: 'https://github.com/quavedev/forms',
});

Package.onUse(api => {
  api.versionsFrom('1.10.2');
  api.use('quave:definitions@1.0.0');
  api.use('ecmascript');

  api.export('Form', 'client');
  api.addFiles('Form.js', 'client');
});
