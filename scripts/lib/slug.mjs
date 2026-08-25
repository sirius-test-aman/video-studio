/**
 * One video = one slug. `product` leads, so two products can share a module and
 * a part without colliding. `part` distinguishes several videos that share a
 * module, e.g. pair-programming split into enhance / quality / security.
 *
 * Knowledge files are looked up by `module` alone — all products and parts
 * share one.
 */
export const slugOf = (spec) =>
  [spec.product, spec.module, spec.part, spec.videoType].filter(Boolean).join("-");

export const assetDirOf = (spec) => `public/assets/${slugOf(spec)}`;
export const libraryDirOf = (spec) => `library/${spec.module}`;
