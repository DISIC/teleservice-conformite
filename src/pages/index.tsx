import { fr } from "@codegouvfr/react-dsfr";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { tss } from "tss-react";

export default function Home() {
  const { classes } = useStyles();

  return (
    <div className={classes.main}>
      <div className={classes.heroSection}>
        <h1>Connectez-vous pour accéder à l'interface</h1>
        <p>Téléservice Conformité</p>
        <ProConnectButton onClick={() => {}} />
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
    gridColumn: "span 6",
    marginLeft: fr.spacing("4w"),
    marginTop: fr.spacing("10w"),
  },
});
