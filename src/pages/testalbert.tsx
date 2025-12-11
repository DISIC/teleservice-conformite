import { useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { tss } from "tss-react";
import { api } from "~/utils/api";

export default function TestAlbert() {
  const { classes } = useStyles();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const albertMutation = api.albert.analyzeUrl.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error:", error);
      setResult({ error: error.message });
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);
    albertMutation.mutate({ url: url.trim() });
  };

  return (
    <div className={fr.cx("fr-my-10v")}>
      <h1>Test Albert API</h1>

      <form onSubmit={handleSubmit}>
        <Input
          label="URL à analyser:"
          nativeInputProps={{
            id: "url",
            type: "url",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://example.com",
            required: true,
          }}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Analyse en cours..." : "Analyser"}
        </Button>
      </form>

      {result && (
        <div className={fr.cx("fr-mt-10v")}>
          <h2>Résultat Albert</h2>
          <pre className={classes.resultPre}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const useStyles = tss.withName(TestAlbert.name).create({
  resultPre: {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    padding: fr.spacing("4w"),
    borderRadius: fr.spacing("1w"),
    overflow: "auto",
    whiteSpace: "pre-wrap",
    border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
  },
});
