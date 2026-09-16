import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const VALID_TREE: Record<string, string> = {
	"thematiques.yml":
		"- number: 1\n  title: Images\n- number: 2\n  title: Cadres\n",
	"criteres/1.1/index.md":
		"Chaque [image](#image) a-t-elle une alternative textuelle ?\n",
	"criteres/1.1/web/annexe.md":
		'---\nreferences:\n  - standard: WCAG 2.1\n    reference: "1.1.1"\n    title: Non-text Content\n    level: A\ntechniques:\n  - H36\n---\n',
	"criteres/1.1/web/notes-techniques.md":
		"Une note sur l’[alternative](#alternative).\n",
	"criteres/1.1/web/tests/1.md":
		"---\ntitle: Chaque image a-t-elle une [alternative](#alternative) ?\n---\n\n1. Retrouver les images ;\n2. Vérifier l’alternative.\n",
	"criteres/1.1/web/tests/2.md":
		"---\ntitle: Chaque image vectorielle vérifie-t-elle ces conditions ?\nconditions:\n  - Elle a un rôle ;\n  - Elle a une [alternative](#alternative).\n---\n\n1. Retrouver les svg.\n",
	"criteres/1.1/mobile/annexe.md":
		'---\nreferences:\n  - standard: EN 301 549 v3.2.1\n    reference: "11.1.1.1"\n    title: Non-text content\n---\n',
	"criteres/1.1/mobile/tests/1.md":
		"---\ntitle: Chaque [image](#image) a-t-elle une description accessible ?\n---\n\n1. Parcourir chaque écran.\n",
	"criteres/1.2/index.md": "Chaque image de décoration est-elle ignorée ?\n",
	"criteres/1.2/web/annexe.md": "---\ntechniques:\n  - H67\n---\n",
	"criteres/1.2/web/tests/1.md": "---\ntitle: Test.\n---\n\n1. Vérifier.\n",
	"glossaire/image.md": "---\ntitle: Image\n---\n\nUne image.\n",
	"glossaire/alternative.md":
		"---\ntitle: Alternative textuelle\nreferentiels:\n  - web\n---\n\nUn nom accessible pour une [image](#image).\n",
};

export function writeTree(files: Record<string, string>): string {
	const root = mkdtempSync(path.join(tmpdir(), "rgaa-content-"));
	for (const [file, text] of Object.entries(files)) {
		mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
		writeFileSync(path.join(root, file), text);
	}
	return root;
}

export function withFiles(changes: Record<string, string | null>): string {
	const files: Record<string, string> = { ...VALID_TREE };
	for (const [file, text] of Object.entries(changes)) {
		if (text === null) delete files[file];
		else files[file] = text;
	}
	return writeTree(files);
}
