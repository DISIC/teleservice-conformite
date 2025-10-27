import { fr } from "@codegouvfr/react-dsfr";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { tss } from "tss-react";
import { authClient } from "~/utils/auth-client";
import Cookies from "js-cookie";

export default function Home() {
  const { classes } = useStyles();

  const signIn = async () => {
    const response = await authClient.signIn.oauth2({
      providerId: "proconnect",
      callbackURL: "/dashboard",
    });

    const urlParams = new URLSearchParams(response?.data?.url);
    Cookies.set("oauth_state", urlParams.get("state") ?? "");
    Cookies.set("oauth_nonce", urlParams.get("nonce") ?? "");
  };

  return (
    <div className={classes.main}>
      <div className={classes.heroSection}>
        <h1>Connectez-vous pour accéder à l'interface</h1>
        <p>Téléservice Conformité</p>
        <ProConnectButton onClick={signIn} />
      </div>
    </div>
  );
}

const useStyles = tss.withName(Home.name).create({
  main: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    alignItems: "initial",
  },
  heroSection: {
    gridColumn: "4 / span 6",
    marginTop: fr.spacing("14w"),
    textAlign: "center",
  },
});
