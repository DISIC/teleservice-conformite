import { formOptions } from "@tanstack/react-form";
import z from "zod";

const sections = [
  "schema",
  "currentYearSchemaLinks",
] as const;

export const schema = z.object({
  schemaDone: z.boolean(),
  currentYearSchemaDone: z.boolean(),
  annualSchemaLink: z.url().optional(),
  annualSchemaFile: z.url().optional(),
});

export type ZSchema = z.infer<typeof schema>;

export const schemaDefaultValues: ZSchema = {
  schemaDone: false,
  currentYearSchemaDone: false,
  annualSchemaLink: undefined,
  annualSchemaFile: undefined,
};

export const schemaFormSchema = z.object({
  section: z.enum(sections),
  ...schema.shape,
});

export type ZSchemaFormSchema = z.infer<
  typeof schemaFormSchema
>;

const defaultValues: ZSchemaFormSchema = {
  section: "schema",
  ...schemaDefaultValues,
};

export const schemaFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: ({ value, formApi }) => {
      return formApi.parseValuesWithSchema(
        schemaFormSchema as typeof schemaFormSchema,
      )        
    }
  }
});