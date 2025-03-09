<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { Personaje } from "@/interfaces/personaje.interface";
import type { Login } from "@/interfaces/Login.Interface";
import { isWhiteSpaceLike } from "typescript";

// URL base del backend desde la cookie o asigna un valor por defecto
const baseURL = useCookie("BASE_URL");
if (!baseURL.value) baseURL.value = "http://localhost:3020";

// Datos del usuario autenticado desde la cookie
const userLogin = useCookie<Login>("user");

// Variables reactivas
const personajes = ref<Personaje[]>([]);
const loading = ref(false);
const dialog = ref(false);
const confirmDialog = ref(false);
const nameModal = ref("Nuevo Personaje");
const indexCharacterList = ref<number | null>(null);
const searchQuery = ref("");
const showDetails = ref<{ [key: number]: boolean }>({});
const personajeToDelete = ref<Personaje | null>(null);
const personajeIndexToDelete = ref<number | null>(null);

// Plantilla para un nuevo personaje (según tu esquema de Prisma)
const characterTemplate: Personaje = {
  id: 0,
  nombre: "",
  foto: "",
  especie: "",
  genero: "",
  estado: "",
  origen: "",
  tipo: "",
  flag: true,
  idUsuario: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const characterEdit = ref<Personaje>({ ...characterTemplate });

// **Cargar personajes**
const loadPersonajes = async () => {
  if (!userLogin.value || !userLogin.value.token) return;
  loading.value = true;
  try {
    const res = await $fetch<{
      statusCode: number;
      msg: string;
      data: Personaje[];
      success: boolean;
    }>(`${baseURL.value}/personaje/list`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userLogin.value.token}` },
    });
    if (res.success) personajes.value = res.data;
  } catch (error) {
    console.error("Error al cargar personajes:", error);
  } finally {
    loading.value = false;
  }
};

// **Filtrar personajes**
const filteredPersonajes = computed(() =>
  personajes.value.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// **Abrir modal para crear un nuevo personaje**
const onClickNewCharacter = () => {
  nameModal.value = "Nuevo Personaje";
  dialog.value = true;
  characterEdit.value = {
    ...characterTemplate,
    idUsuario: userLogin.value?.id ?? 0,
  };
  indexCharacterList.value = null;
};
  
// **Abrir modal para editar un personaje**
const onClickEditCharacter = (item: Personaje, index: number) => {
  nameModal.value = "Editar Personaje";
  dialog.value = true;
  characterEdit.value = { ...item };
  indexCharacterList.value = index;
};

// **Abrir modal de confirmación de eliminación**
const onClickDeleteCharacter = (item: Personaje, index: number) => {
  personajeToDelete.value = item;
  personajeIndexToDelete.value = index;
  confirmDialog.value = true;
};

// **Eliminar personaje**
const confirmDeleteCharacter = async () => {
  if (
    !userLogin.value ||
    !userLogin.value.token ||
    !personajeToDelete.value ||
    personajeIndexToDelete.value === null
  )
    return;

  try {
    await $fetch(`${baseURL.value}/personaje/${personajeToDelete.value.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userLogin.value.token}` },
    });

    personajes.value.splice(personajeIndexToDelete.value, 1);
  } catch (error) {
    console.error("Error al eliminar personaje:", error);
  } finally {
    confirmDialog.value = false;
    personajeToDelete.value = null;
    personajeIndexToDelete.value = null;
  }
};
// **Guardar personaje (Crear o Editar)**
const saveCharacter = async () => {
  if (!userLogin.value || !userLogin.value.token) return;

  const isEditing = indexCharacterList.value !== null;
  const endpoint = "/personaje";
  const method = isEditing ? "PUT" : "POST";

  try {
    const res = await $fetch<{
      statusCode: number;
      msg: string;
      data: Personaje;
      success: boolean;
    }>(`${baseURL.value}${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${userLogin.value.token}` },
      body: characterEdit.value,
    });

    if (res.success) {
      if (isEditing && indexCharacterList.value !== null) {
        personajes.value[indexCharacterList.value] = res.data;
      } else {
        personajes.value.push(res.data);
      }
      dialog.value = false;
      loadPersonajes();
    } else {
      console.warn("No se pudo guardar el personaje");
    }
  } catch (error) {
    console.error("Error al guardar personaje:", error);
  }
};

// Alternar detalles de personaje
const toggleDetails = (id: number) => {
  showDetails.value[id] = !showDetails.value[id];
};

// Cargar personajes al montar el componente
onMounted(() => {
  loadPersonajes();
});
</script>

<template>
  <v-container fluid>
    <!-- Barra de búsqueda -->
    <v-row justify="start">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar personaje"
          prepend-inner-icon="mdi-magnify"
          class="custom-search"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <!-- Botón para crear un nuevo personaje -->
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-btn
          size="x-large"
          block
          color="indigo-darken-4"
          @click="onClickNewCharacter"
        >
          Nuevo Personaje
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de personajes -->
    <v-row>
      <v-col
        v-for="(item, index) in filteredPersonajes"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mx-auto card-style">
          <v-img height="200px" :src="item.foto" cover></v-img>
          <v-card-title>{{ item.nombre }}</v-card-title>
          <v-card-subtitle>{{ item.especie }}</v-card-subtitle>
          <v-card-actions>
            <v-btn
              class="Button-editar"
              icon
              color="blue-lighten-2"
              @click="onClickEditCharacter(item, index)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              class="Button-eliminar"
              icon
              color="red-darken-2"
              @click="onClickDeleteCharacter(item, index)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click="toggleDetails(item.id)">
              <v-icon>{{
                showDetails[item.id] ? "mdi-chevron-up" : "mdi-chevron-down"
              }}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="showDetails[item.id]">
              <v-divider></v-divider>
              <v-card-text>
                <div><strong>Género:</strong> {{ item.genero }}</div>
                <div><strong>Estado:</strong> {{ item.estado }}</div>
                <div><strong>Origen:</strong> {{ item.origen }}</div>
                <div><strong>Tipo:</strong> {{ item.tipo }}</div>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para Crear/Editar -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="modal-dark">
        <v-card-title class="modal-title">{{ nameModal }}</v-card-title>
        <v-card-text>
          <v-text-field
            label="Nombre"
            v-model="characterEdit.nombre"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Foto (URL)"
            v-model="characterEdit.foto"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Especie"
            v-model="characterEdit.especie"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Género"
            v-model="characterEdit.genero"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Estado"
            v-model="characterEdit.estado"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Origen"
            v-model="characterEdit.origen"
            class="custom-input"
            variant="outlined"
          />
          <v-text-field
            label="Tipo"
            v-model="characterEdit.tipo"
            class="custom-input"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-btn color="red-darken-2" variant="outlined" @click="dialog = false"
            >Cancelar</v-btn
          >
          <v-spacer />
          <v-btn color="green-accent-3" variant="flat" @click="saveCharacter"
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Modal de Confirmación de Eliminación -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card class="modal-dark">
        <v-card-title class="modal-title">
          ¿Seguro de la acción?
        </v-card-title>
        <v-card-text class="modal-text">
          Esta acción no se puede deshacer. El personaje será eliminado
          permanentemente.
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-btn
            color="grey-darken-2"
            variant="outlined"
            @click="confirmDialog = false"
          >
            <v-icon left>mdi-close</v-icon> Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="red-accent-3"
            variant="flat"
            @click="confirmDeleteCharacter"
          >
            <v-icon left>mdi-delete</v-icon> Sí, eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.card-style {
  background-color: #000000;
  color: white;
  border-radius: 10px;
  transition: transform 0.2s;
}
.card-style:hover {
  transform: scale(1.05);
}
</style>

<style scoped>
/* 🌑 Modal con fondo oscuro */
.modal-dark {
  background-color: #1a1a1a;
  color: white;
  border-radius: 15px !important;
  padding: 16px;
}

/* ✍️ Título del modal */
.modal-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #fafafa;
  text-align: center;
}

/* Estiliza los campos de entrada y elimina la línea gruesa */
.custom-input :deep(.v-input__control) {
  background-color: #2a2a2a !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease-in-out;
  box-shadow: none !important; /* Elimina sombras innecesarias */
}

/* 🛠️ Corrige el padding y el margen */
.custom-input {
  margin-bottom: 5px;
}

/* 🎭 Botones estilizados */
.modal-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
}

/* ✅ Quita la línea gruesa debajo de los inputs */
.custom-input :deep(.v-field__outline) {
  border: none !important;
}

.Button-editar {
  border: 1px blue solid;
}
.Button-eliminar {
  border: 1px red solid;
}
</style>

<style scoped>
/* 🌑 Modal con fondo oscuro */
.modal-dark {
  background-color: #1e1e1e;
  color: white;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
}

/* 🔥 Título del modal en rojo fuerte */
.modal-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e3e2e2;
  padding-bottom: 8px;
}

/* 📝 Texto del modal */
.modal-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  padding-bottom: 16px;
}

/* 🎭 Botones estilizados */
.modal-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
}

/* 🎨 Animación suave al abrir */
.v-dialog {
  transition: transform 0.2s ease-in-out;
}
</style>
