import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const contact = z.object({
  contactType: z.array(z.string()).min(1, { message: "Au moins un type de contact doit être sélectionné" }),
  contactLink: z.url().optional(),
  emailContact: z.email(),
});

export type ZContact = z.infer<typeof contact>;

export const contactDefaultValues: ZContact = {
  contactType: [""],
  contactLink: undefined,
  emailContact: "",
};

export const contactFormOptions = formOptions({
  defaultValues: contactDefaultValues,
  validators: {
    onSubmit: ({ value, formApi }) => {
      return formApi.parseValuesWithSchema(
        contact as typeof contact,
      )        
    }
  }
});