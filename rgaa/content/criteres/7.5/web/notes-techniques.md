Les rôles WAI-ARIA log, status et alert ont implicitement une valeur d’attribut WAI-ARIA aria-live et aria-atomic. On pourra donc considérer (conformément à la spécification WAI-ARIA 1.1) que :

- Un attribut WAI-ARIA aria-live="polite" associé à un message de statut peut valoir pour un rôle WAI-ARIA log ;

- Un attribut WAI-ARIA aria-live="polite" et un attribut WAI-ARIA aria-atomic="true" associés à un message de statut peuvent valoir pour un rôle WAI-ARIA status ;

- Un attribut WAI-ARIA aria-live="assertive" et un attribut WAI-ARIA aria-atomic="true" associés à un message de statut peuvent valoir pour un rôle WAI-ARIA alert.

C’est sous réserve que la nature du message d'état satisfasse bien à la correspondance implicitement établie. Dans le cas d’un message d'état indiquant la progression d’un processus et matérialisé graphiquement par une barre de progression, un rôle WAI-ARIA progressbar explicite est nécessaire.
