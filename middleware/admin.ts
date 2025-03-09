import type { Login } from "~/interfaces/Login.Interface";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userLogin = useCookie<Login | null>("user");
    const baseURL = useCookie("BASE_URL");

    // Verificar si el usuario está autenticado
    if (!userLogin.value || !userLogin.value.token) {
        console.warn("⚠ No hay usuario autenticado. Redirigiendo a inicio...");
        return navigateTo("/");
    }

    // Verificar si el usuario tiene el rol "ADMIN"
    if (!userLogin.value.rol || userLogin.value.rol.toUpperCase() !== "ADMIN") {
        console.warn("Acceso denegado. Se requiere ser ADMIN.");
        return navigateTo("/inicio"); // Redirigir si no es admin
    }

    try {
        // Intentar refrescar el token para mantener la sesión activa
        const { data: resRefreshToken } = await useFetch<Login>(`${baseURL.value}/auth/refresh-token`, {
            method: "POST",
            body: JSON.stringify({ token: userLogin.value.token }),
            headers: { "Content-Type": "application/json" }
        });

        if (!resRefreshToken.value || resRefreshToken.value.status === false) {
            console.warn("Token inválido o expirado. Cerrando sesión...");
            userLogin.value = null;
            return navigateTo("/");
        }

        // ✅ Si el token se refrescó correctamente, actualizar los datos del usuario
        userLogin.value = resRefreshToken.value;
        console.log("Token actualizado. Permiso concedido.");
    } catch (error) {
        console.error("Error al refrescar el token:", error);
        userLogin.value = null;
        return navigateTo("/");
    }
});
