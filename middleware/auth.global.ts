import type { Login } from "~/interfaces/Login.Interface";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userLogin = useCookie<Login | null>("user");
    const baseURL = useCookie("BASE_URL");
    if (to.path === "/") return

    if (!userLogin.value || !userLogin.value.token) return navigateTo('/')

    const { data: resRefreshToken } = await useFetch<Login>(`${baseURL.value}/auth/refresh-token`,
        {
            method: "POST",
            body: {
                token: userLogin.value.token
            }
        }
    );
    if (resRefreshToken.value?.status === false) {
        userLogin.value = null
        return navigateTo('/')
    }

    userLogin.value = resRefreshToken.value


})