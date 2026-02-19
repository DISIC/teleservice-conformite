import { Input } from "@codegouvfr/react-dsfr/Input";

export default function AraUpdateModalContent({
	araLink,
	setAraLink,
}: { araLink: string; setAraLink: (value: string) => void }) {
	return (
		<div>
			<p>
				<strong>L’intégralité des informations</strong> d’audit, de contact et
				de plans d’action <strong>seront mises à jour.</strong>
			</p>
			<Input
				label="Lien URL de la déclaration Ara (obligatoire)"
				hintText="Format attendu : https://ara.numerique.gouv.fr/declaration/xxxxxxx"
				nativeInputProps={{
					onChange: (e) => {
						setAraLink(e.target.value);
					},
				}}
			/>
		</div>
	);
}
