<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

import type { Login } from "@/interfaces/Login.Interface";

// Obtenemos la URL base desde la cookie o asignamos un valor por defecto
const baseURL = useCookie("BASE_URL");
if (!baseURL.value) {
  baseURL.value = "http://localhost:3020";
}

// Cookie para almacenar la info del usuario
const userLogin = useCookie<Login>("user");

// Variables reactivas para el formulario
const email = ref("");
const password = ref("");

// Estados y mensajes
const loadingLogin = ref(false);
const msgAlert = ref("");

// Reglas de validación (asegúrate de tener implementado useFormRules)
const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();

// Variable para decodificar el token (opcional)
const decodeToken = ref();

// Función de login usando $fetch
const onClickLogin = async () => {
  loadingLogin.value = true;
  msgAlert.value = "";

  if (!email.value || !password.value) {
    msgAlert.value = "Llene los datos correctamente";
    loadingLogin.value = false;
    return;
  }

  try {
    const resLogin = await $fetch<Login>(`${baseURL.value}/auth/login`, {
      method: "POST",
      body: { email: email.value, password: password.value },
    });

    if (!resLogin?.status) {
      msgAlert.value = "Las credenciales proporcionadas no son correctas";
      loadingLogin.value = false;
      return;
    }

    console.log("✅ Usuario a guardar en cookie:", JSON.stringify(resLogin));

    userLogin.value = {
      id: resLogin.id,
      nombres: resLogin.nombres,
      email: resLogin.email,
      rol: resLogin.rol ?? "GUEST", // 🔥 Si `rol` es undefined, asignar un valor por defecto
      token: resLogin.token,
      status: resLogin.status,
    };

    // ✅ Verificar después de guardar en la cookie
    console.log(
      "✅ Usuario guardado en cookie:",
      JSON.stringify(userLogin.value)
    );

    loadingLogin.value = false;
    navigateTo("/inicio");
  } catch (error) {
    msgAlert.value = "Ocurrió un error al iniciar sesión";
    console.error(error);
    loadingLogin.value = false;
  }
};

// Función para refrescar el token (opcional)
const decodeTokenBtn = async () => {
  try {
    const tokenDec = await $fetch<Login>(
      `${baseURL.value}/auth/refresh-token`,
      {
        method: "POST",
        body: {
          token: userLogin.value.token,
        },
      }
    );
    decodeToken.value = tokenDec;
  } catch (error) {
    console.error("Error al refrescar token:", error);
  }
};
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters class="fill-height d-flex align-center justify-center">
      <v-col cols="12" md="6" lg="5" sm="6">
        <v-row no-gutters class="d-flex align-center justify-center">
          <v-col cols="12" md="6">
            <h1>Iniciar sesión</h1>
            <p class="text-medium-emphasis">Ingresa tus datos</p>

            <!-- Campo de email -->
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="email">Email</label>
              <VTextField
                :rules="[ruleRequired, ruleEmail]"
                v-model="email"
                prepend-inner-icon="fluent:mail-24-regular"
                id="email"
                name="email"
                type="email"
                @keydown.enter="onClickLogin"
              />
            </div>

            <!-- Campo de contraseña -->
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="password"
                >Contraseña</label
              >
              <VTextField
                :rules="[ruleRequired, rulePassLen]"
                v-model="password"
                prepend-inner-icon="fluent:password-20-regular"
                id="password"
                name="password"
                type="password"
                @keydown.enter="onClickLogin"
              />
            </div>

            <!-- Mensaje de error -->
            <div class="my-2">
              <v-alert v-if="msgAlert" color="error">{{ msgAlert }}</v-alert>
            </div>

            <!-- Botón para iniciar sesión -->
            <div class="mt-5">
              <v-btn
                @click="onClickLogin"
                :loading="loadingLogin"
                block
                min-height="44"
                class="gradient primary"
              >
                Ingresar
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        class="hidden-md-and-down fill-height d-flex align-center justify-center"
        md="6"
        lg="7"
      >
        <v-img src="public/fondo/fondo1.png" max-width="75%">
          <div class="text-center w-50 text-white mx-auto align-center"></div>
        </v-img>
      </v-col>
    </v-row>
  </v-container>
</template>
