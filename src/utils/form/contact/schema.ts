import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const contact = z.object({
  contactType: z.array(z.string()).min(1, { message: "Au moins un type de contact doit être sélectionné" }),
  contactLink: z.union([z.url(), z.literal("")]),
  emailContact: z.email(),
});

export type ZContact = z.infer<typeof contact>;

export const contactDefaultValues: ZContact = {
  contactType: [""],
  contactLink: "",
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