module.exports = function() {
  return {
    name: 'transform-import-meta-env',
    visitor: {
      MemberExpression(path) {
        // Check if this is import.meta.env.SOMETHING
        if (
          path.node.object.type === 'MemberExpression' &&
          path.node.object.object.type === 'MetaProperty' &&
          path.node.object.object.meta.name === 'import' &&
          path.node.object.object.property.name === 'meta' &&
          path.node.object.property.name === 'env'
        ) {
          // Replace import.meta.env.VARNAME with process.env.VARNAME
          const varName = path.node.property.name;
          path.replaceWithSourceString(`process.env.${varName}`);
        }
      }
    }
  };
};
