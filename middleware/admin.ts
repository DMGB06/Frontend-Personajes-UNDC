import type { Login } from "~/interfaces/Login.Interface";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userLogin = useCookie<Login | null>("user");
    const baseURL = useCookie("BASE_URL");

    // ✅ Verificar si el usuario está autenticado
    if (!userLogin.value || !userLogin.value.token) {
        return navigateTo("/");
    }

    // ✅ Verificar si el usuario tiene el tipo "ADMIN"
    if (userLogin.value.rol.toLowerCase() !== "ADMIN") {
        return navigateTo("/"); // Redirigir si no es admin
    }

    // ✅ Intentar refrescar el token para mantener la sesión activa
    const { data: resRefreshToken } = await useFetch<Login>(`${baseURL.value}/auth/refresh-token`, {
        method: "POST",
        body: {
            token: userLogin.value.token
        }
    });

    if (!resRefreshToken.value || resRefreshToken.value.status === false) {
        userLogin.value = null;
        return navigateTo("/");
    }

    // ✅ Si el token se refrescó correctamente, actualizar los datos del usuario
    userLogin.value = resRefreshToken.value;
});
