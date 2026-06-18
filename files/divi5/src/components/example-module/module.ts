// Front-End script for the Example Module.
//
// Compiled by webpack to scripts/module.js and enqueued from the module's
// render_callback (modules/ExampleModule/ExampleModuleTrait/RenderCallbackTrait.php).
// One instance is created per module rendered on the page — add the module's
// Front-End behaviour inside the constructor.

class ExampleModule {
  constructor(root: HTMLElement) {
    root.classList.add('is_example_module--ready');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLElement>('.is_example_module').forEach((el) => {
    new ExampleModule(el);
  });
});
