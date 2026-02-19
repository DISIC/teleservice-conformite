export function getInvitationUserEmailHtml({
	link,
	fullName,
	declarationName,
	administrationName,
}: {
	link: string;
	fullName: string;
	declarationName: string;
	administrationName: string;
}): string {
	return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <title>Invitation - Déclaration d’accessibilité</title>
      </head>
      <body style="margin:0; padding:0; background:#ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 30px 15px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px; max-width:600px; background:#ffffff;">
                <tr>
                  <td style="padding: 10px 0 20px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="80" valign="middle" style="padding-right: 15px;">
                          <img src="LOGO_URL" alt="République Française" width="70" style="display:block; border:0; outline:none; text-decoration:none;" />
                        </td>
                        <td valign="middle" style="font-size: 22px; font-weight: bold; color:#000000;">
                          Déclaration d’accessibilité
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #e0e0e0; padding: 20px 0;"></td>
                </tr>
                <tr>
                  <td style="font-size:16px; line-height:24px; color:#000000; padding: 0 0 20px 0;">
                    Bonjour,
                  </td>
                </tr>
                <tr>
                  <td style="font-size:16px; line-height:26px; color:#000000; padding: 0 0 25px 0;">
                    <strong>${fullName}</strong> vous invite à rejoindre la plateforme (NOM DE L’OUTIL) et vous donne accès à la déclaration
                    <strong>${declarationName}</strong>, de l’administration <strong>${administrationName}</strong>.
                  </td>
                </tr>
                <tr>
                  <td style="font-size:16px; line-height:24px; color:#000000; padding: 0 0 25px 0;">
                    Afin de créer votre compte, veuillez cliquer sur le bouton ci-dessous :
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px 0 35px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="background:#000091; padding:14px 28px;">
                          <a href="${link}" style="font-size:16px; text-decoration:none; color:#ffffff; display:inline-block;">
                            Accepter l’invitation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f2f2f2; padding: 20px; font-size:14px; line-height:22px; color:#000000;">
                    <p style="margin:0 0 12px 0;">
                      Ce message est envoyé automatiquement par le site <strong>Déclaration d’accessibilité</strong>, développé par la
                      Brigade d’Intervention Numérique, propulsé par la Direction interministérielle du numérique.
                    </p>
                    <p style="margin:0;">
                      Pour toute question, envoyez-nous un mail à <a href="#" style="color:#000000; text-decoration:underline;">?</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
