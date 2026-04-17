// src/utils/relations.js
function makeDescendantRelations(paths, callbacks) {
  const relations = {};
  paths.forEach((path) => {
    relations[path] = {
      type: 'descendant',
      linked() {
        callbacks.linked?.call(this);
      },
      linkChanged() {
        callbacks.linkChanged?.call(this);
      },
      unlinked() {
        callbacks.unlinked?.call(this);
      },
    };
  });
  return relations;
}

module.exports = { makeDescendantRelations };
