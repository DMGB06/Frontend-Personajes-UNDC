<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { Company } from "~/interfaces/Company.interface";
import type { Login } from "~/interfaces/Login.Interface";
const drawer = useCookie<boolean>("drawer");
const rail = useCookie<boolean>("rail");
rail.value = false;
const { mobile } = useDisplay();

const userCookie = useCookie<string | Login>("user");

const user = computed(() => {
  if (!userCookie.value) return null;

  try {
    return typeof userCookie.value === "string" &&
      userCookie.value.startsWith("{")
      ? JSON.parse(userCookie.value)
      : userCookie.value;
  } catch (error) {
    console.error("Error al parsear la cookie:", error);
    return null;
  }
});



const company = useCookie<Company>("company");
company.value = {
  name: "UNDC",
  logo: "https://www.undc.edu.ar/wp-content/uploads/2020/03/logo-undc.png",
};
const isRule = (rule: string[]) => {
  if (!user.value) return false;
  if (!user.value.rol) return false; // Cambiado de tipoUsuario a rol
  return rule.includes(user.value.rol); // Verifica si el rol está en la lista permitida
};

const menus = ref([
  {
    icon: "mdi-sale",
    title: "Inicio",
    value: "inicio",
    to: "/inicio",
    view: true,
  },
  {
    icon: "mdi-animation",
    title: "Post",
    value: "post",
    to: "/post",
    view: true,
  },
  {
    icon: "mdi-animation",
    title: "Configuraciones",
    value: "config",
    to: "#",
    view: isRule(["ADMIN"]), // ✅ Se usa isRule con rol corregido
    toSub: [
      {
        title: "Usuarios",
        value: "usuarios",
        to: "/configurations/usuarios",
        view: isRule(["ADMIN"]),
      },
      {
        title: "Avanzado",
        value: "avanzado",
        to: "/configurations/avanzado",
        view: isRule(["ADMIN"]),
      },
    ],
  },
]);
</script>
<template>
  <v-navigation-drawer
    expand-on-hover
    v-model="drawer"
    :temporary="mobile"
    :rail="!mobile ? rail : false"
    theme="dark"
  >
    <v-list-item
      class="d-flex align-center justify-center"
      prepend-avatar="https://upload.wikimedia.org/wikipedia/commons/5/59/UNDC_logo.jpg"
      nav
    >
    </v-list-item>
    <v-divider></v-divider>
    <v-list nav>
      <div v-for="menu in menus" :key="menu.to">
        <v-list-item
          v-if="!menu.toSub && menu.view"
          :prepend-icon="menu.icon"
          :title="menu.title"
          :value="menu.value"
          :to="menu.to"
        ></v-list-item>
        <v-list-group
          v-if="menu.toSub && menu.view"
          :value="menu.title"
          class="v-list-group__items"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="menu.icon"
              :title="menu.title"
            ></v-list-item>
          </template>
          <div v-for="subMenu in menu.toSub" :key="subMenu.to">
            <v-list-item
              v-if="subMenu.view"
              height="12px"
              prepend-icon="mdi-vector-point"
              :title="subMenu.title"
              :value="subMenu.value"
              :to="subMenu.to"
            >
            </v-list-item>
          </div>
        </v-list-group>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<style>
.v-list-group__items {
  --indent-padding: -0.5rem !important;
}
</style>
