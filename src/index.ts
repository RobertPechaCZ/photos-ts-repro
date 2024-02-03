import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import InputGroupPlugin from "./plugin";

SchemaBuilder.allowPluginReRegistration = true;

export const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true;
}>({
  defaultInputFieldRequiredness: true,
  plugins: [InputGroupPlugin, SimpleObjectsPlugin],
});
