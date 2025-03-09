export const useFormRules = () => {
	return {
		ruleRequired: (v: any) => !!v || "Requerido",
		ruleEmail: (value: any) => {
			const pattern =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return pattern.test(value) || "Introduzca un correo electrónico válido.";
		},
		rulePassLen: (v: string) => (!!v && v.length >= 6) || "La contraseña debe tener 6 caracteres o más.",
	};
};
