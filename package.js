Package.describe({
  name: "quave:autoformik",
  version: "0.0.1",
  summary: "Create Formik forms automatically from a SimpleSchema object.",
  git: "https://github.com/quavedev/autoformik"
});

Package.onUse(api => {
  api.versionsFrom("1.10.2");
  api.use("quave:definitions");

  api.mainModule("autoformik.js");
});
