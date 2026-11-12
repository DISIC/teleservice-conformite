export const publicDeclarationPath = (declaration: {
	published_declaration_slug?: string | null;
}) => `/declarations/${declaration.published_declaration_slug ?? ""}`;
