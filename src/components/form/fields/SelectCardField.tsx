import { useRef } from "react";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

import { useFieldContext } from "~/utils/form/context";

interface SelectCardFieldProps {
  name: string;
  label: string;
  options: {
    id: string;
    image: React.ReactNode;
    label: string;
    description?: string;
  }[];
  onChange: (value: string) => void;
}

export function SelectCardField(props: SelectCardFieldProps) {
  const { name, options = [], label, onChange } = props;
  const field = useFieldContext<string>();
  const { classes, cx } = useStyles();
  const inputRef = useRef<Record<string, HTMLInputElement | null>>({});

  return (
    <div className={classes.fieldWrapper}>
      <label htmlFor={name}>{label}</label>
      {options.map(({ id, image, label: optionLabel, description }) => {
        const inputId = `${name}-${id}`;
        const checked = field.state.value === id;

        return (
          <div key={id} className={classes.optionWrapper}>
            <input
              ref={(element) => {
                inputRef.current[id] = element;
              }}
              id={inputId}
              name={name}
              type="radio"
              value={id}
              checked={checked}
              onChange={() => {
                onChange(id);
                field.setValue(id);
              }}
              className={classes.hiddenRadio}
            />
            <label
              htmlFor={inputId}
              className={cx(
                classes.optionButton,
                checked && classes.optionButtonChecked,
              )}
            >
              {image}
              <span>
                <h2 className={classes.label}>{optionLabel}</h2>
                {description && (
                  <p className={cx(classes.description, fr.cx("fr-text--sm"))}>
                    {description}
                  </p>
                )}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

const useStyles = tss.withName(SelectCardField.name).create({
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: fr.spacing("4v"),
  },
  optionWrapper: {
    display: "flex",
    alignItems: "center",
  },
  hiddenRadio: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",

    "&:focus + label": {
      outline: `2px solid ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
      outlineOffset: "2px",
    },
  },
  optionButton: {
    display: "flex",
    flexDirection: "row",
    border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    padding: fr.spacing("6v"),
    alignItems: "center",
    gap: fr.spacing("6v"),
    cursor: "pointer",
    width: "100%",
    backgroundColor: fr.colors.decisions.background.default.grey.default,

    "@media (max-width: 830px)": {
      flexDirection: "column",
    },

    "&:hover": {
      backgroundColor: fr.colors.decisions.background.default.grey.hover,
    },

    "& p": {
      margin: 0,
      textAlign: "left",
    },

    "& span": {
      display: "flex",
      flexDirection: "column",
      gap: fr.spacing("2w"),
    },
  },
  optionButtonChecked: {
    backgroundColor: fr.colors.decisions.background.raised.grey.active,

    "& > span > h2": {
      color: fr.colors.decisions.text.actionHigh.blueFrance.default,
    },
  },
  label: {
    color: fr.colors.decisions.text.title.grey.default,
    margin: 0,
    textAlign: "left",
    fontSize: fr.typography[19].style.fontSize,
    lineHeight: fr.typography[19].style.lineHeight,
    fontWeight: 700,
  },
  description: {
    color: fr.colors.decisions.text.default.grey.default,
  },
});
