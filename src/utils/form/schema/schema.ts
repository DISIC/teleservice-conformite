import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const schema = z.object({
  hasDoneCurrentYearSchema: z.boolean(),
  currentYearSchemaUrl: z.string().optional(),
  hasDonePreviousYearsSchema: z.boolean(),
  previousYearsSchemaUrl: z.string().optional(),
});

export type ZSchema = z.infer<typeof schema>;

export const schemaDefaultValues: ZSchema = {
  hasDoneCurrentYearSchema: false,
  currentYearSchemaUrl: undefined,
  hasDonePreviousYearsSchema: false,
  previousYearsSchemaUrl: undefined,
};

export const schemaFormSchema = z.object({
  ...schema.shape,
});

export type ZSchemaFormSchema = z.infer<
  typeof schemaFormSchema
>;

const defaultValues: ZSchemaFormSchema = {
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