import { render } from "@react-email/render";
import { ConfirmationEmail, type ConfirmationEmailProps } from "~/utils/emails/ConfirmationEmail";
import { InviteEmail, type InviteEmailProps } from "~/utils/emails/InviteEmail";

const logoUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
	? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/republique_francaise_rvb.png`
	: undefined;

export async function getInvitationUserEmailHtml(
	props: Omit<ConfirmationEmailProps, "logoUrl">,
): Promise<string> {
	return render(ConfirmationEmail({ ...props, logoUrl }));
}

export async function getInviteAcceptRecapEmailHtml(
	props: Omit<InviteEmailProps, "logoUrl">,
): Promise<string> {
	return render(InviteEmail({ ...props, logoUrl }));
}
