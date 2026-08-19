/**
 * One video = one slug. `part` distinguishes several videos that share a module,
 * e.g. pair-programming split into enhance / quality / security.
 *
 * Knowledge files are looked up by `module` alone — all parts share one.
 */
export const slugOf = (spec) =>
  [spec.module, spec.part, spec.videoType].filter(Boolean).join("-");

export const assetDirOf = (spec) => `public/assets/${slugOf(spec)}`;
export const libraryDirOf = (spec) => `library/${spec.module}`;
