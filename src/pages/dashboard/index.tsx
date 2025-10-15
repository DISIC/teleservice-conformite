import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

export default function Home() {
  const { classes } = useStyles();

  return (
    <div className={classes.main}>
      <h1>Dashboard</h1>
    </div>
  );
}

const useStyles = tss.withName(Home.name).create({
  main: {
    marginTop: fr.spacing("6v"),
  },
});
