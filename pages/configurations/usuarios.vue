<!-- En la parte del script -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useFetch } from "#app";
import type { Usuario } from "@/interfaces/usuario.interface";
import { useCookie } from "#app";

definePageMeta({
  middleware: "admin",
});
  
const baseURL = useCookie("BASE_URL");
if (!baseURL.value) baseURL.value = "http://localhost:3020";

const userLogin = useCookie<string>("user");
const userData = computed(() => {
  if (!userLogin.value) return {};
  try {
    return typeof userLogin.value === "string"
      ? JSON.parse(userLogin.value)
      : userLogin.value;
  } catch (error) {
    console.error("Error al parsear userLogin:", error);
    return {};
  }
});
const token = computed(() => userData.value?.token || "");

// Variables de usuarios
const usuarios = ref<Usuario[]>([]);
const dialog = ref(false);
const confirmDialog = ref(false);
const dialogEditar = ref(false);
const modalTitle = ref("Nuevo Usuario");
const selectedUserIndex = ref<number | null>(null);
const userToDelete = ref<Usuario | null>(null);
const userIndexToDelete = ref<number | null>(null);
const searchQuery = ref("");
const filteredUsuarios = computed(() =>
  usuarios.value.filter((u) =>
    u.nombres.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// Estado del Snackbar
const snackbar = ref(false);
const snackbarMessage = ref("");

// Definición del modelo de usuario
const userTemplate: Usuario = {
  id: 0,
  nombres: "",
  email: "",
  rol: "REGULAR",
  password: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const userEdit = ref<Usuario>({ ...userTemplate });

// Cargar lista de usuarios
const loadUsuarios = async () => {
  if (!token.value) {
    console.error("⚠ No hay token disponible");
    return;
  }
  try {
    const res = await useFetch<{ success: boolean; data: Usuario[] }>(
      `${baseURL.value}/usuario/list`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    if (res.data?.value?.success) {
      usuarios.value = res.data.value.data;
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
};

// Abrir modal para nuevo usuario
const onClickNewUser = () => {
  modalTitle.value = "Nuevo Usuario";
  dialog.value = true;
  userEdit.value = { ...userTemplate };
  selectedUserIndex.value = null;
};

// Abrir modal para editar usuario
const onClickEditUser = (user: Usuario, index: number) => {
  modalTitle.value = "Editar Usuario";
  dialogEditar.value = true;
  userEdit.value = JSON.parse(JSON.stringify(user));
  selectedUserIndex.value = index;
};
const onClickDeleteUser = (user: Usuario, index: number) => {
  userToDelete.value = user;
  userIndexToDelete.value = index;
  confirmDialog.value = true;
};

const confirmDeleteUser = async () => {
  if (!token.value || !userToDelete.value) return;
  try {
    await useFetch(`${baseURL.value}/usuario/${userToDelete.value.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    usuarios.value.splice(userIndexToDelete.value!, 1);
    showSnackbar("Usuario eliminado exitosamente.");
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
  } finally {
    confirmDialog.value = false;
    userToDelete.value = null;
    userIndexToDelete.value = null;
  }
};

// Guardar usuario (Crear)
const saveUser = async () => {
  if (!token.value) return;

  const userToSend: Partial<Usuario> = { ...userEdit.value };

  console.log("📤 Enviando usuario al backend:", JSON.stringify(userToSend));

  try {
    const res = await useFetch<{ success: boolean; data: Usuario }>(
      `${baseURL.value}/usuario`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToSend),
      }
    );

    if (res.data?.value?.success) {
      usuarios.value.push(res.data.value.data);
      dialog.value = false;
      showSnackbar("Usuario creado exitosamente.");
      loadUsuarios();
    } else {
      console.error("❌ Error en la respuesta del servidor:", res.data?.value);
    }
  } catch (error) {
    console.error("❌ Error al guardar usuario:", error);
  }
};


// **Actualizar usuario**
const updateUser = async () => {
  if (!token.value || selectedUserIndex.value === null) return;

  if (!userEdit.value.id) {
    console.error("⚠ Error: Falta el ID del usuario");
    return;
  }

  if (!userEdit.value.rol) {
    userEdit.value.rol = "ADMIN"; 
  }

  // Clonamos el objeto usuario para asegurarnos de no modificar el estadso original
  const userToSend: Partial<Usuario> = { ...userEdit.value };

  // **Asegurarnos de que el campo `password` realmente está vacío**
  console.log("🛠 Revisando `password` antes de enviar:", userToSend.password);
  console.log("📤 Enviando usuario al backend:", JSON.stringify(userToSend));
  // **Si la contraseña está vacía o nula, eliminarla**
  if (!userToSend.password || userToSend.password.trim() === "") {
    delete userToSend.password;
  }


  try {
    const res = await useFetch<{ success: boolean; data: Usuario }>(
      `${baseURL.value}/usuario`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToSend),
      }
    );

    if (res.data?.value?.success) {
      usuarios.value[selectedUserIndex.value] = res.data.value.data;
      dialogEditar.value = false;
      showSnackbar("Usuario actualizado exitosamente.");
      loadUsuarios();
    } else {
      console.error("❌ Error en la respuesta del servidor:", res.data?.value);
    }
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
  }
};




// Mostrar notificación
const showSnackbar = (message: string) => {
  snackbarMessage.value = message;
  snackbar.value = true;
};

onMounted(() => {
  loadUsuarios();
});
</script>

<template>
  <v-container>
    <v-card class="dark-card">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            label="Buscar usuario"
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
      </v-row>

      <v-btn color="primary" dark @click="onClickNewUser">Nuevo Usuario</v-btn>

      <v-table class="dark-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsuarios" :key="user.id">
            <td>{{ user.nombres }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.rol }}</td>
            <td>
              <v-btn icon color="blue" @click="onClickEditUser(user, index)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="onClickDeleteUser(user, index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

      <!-- Modal para Crear usuario -->
      <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Nuevo Usuario</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" v-model="userEdit.nombres" />
          <v-text-field label="Email" v-model="userEdit.email" />
          <v-text-field label="Contraseña" v-model="userEdit.password" type="password" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveUser">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para editar Usuario -->
    <v-dialog v-model="dialogEditar" max-width="500">
      <v-card>
        <v-card-title>Editar Usuario</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" v-model="userEdit.nombres" />
          <v-text-field label="Email" v-model="userEdit.email" />
          <v-select label="Rol" v-model="userEdit.rol" :items="['ADMIN', 'REGULAR']" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialogEditar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="updateUser">Actualizar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Confirmación de Eliminación -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">¿Eliminar usuario?</v-card-title>
        <v-card-text>Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="confirmDialog = false">Cancelar</v-btn>
          <v-btn color="red" @click="confirmDeleteUser">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para Notificaciones -->
    <v-snackbar v-model="snackbar" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.dark-card {
  background-color: #1e1e1e;
  color: white;
  padding: 20px;
  border-radius: 10px;
}
.dark-table {
  background-color: #222;
  color: white;
}
</style>
