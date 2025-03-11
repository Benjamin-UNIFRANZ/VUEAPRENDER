<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="text-center">Cargando...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-white">Mis Espacios de Proyecto</h2>
        <button @click="showNewSpaceModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <i class="bi bi-plus-circle mr-2"></i> Nuevo Espacio
        </button>
      </div>

      <!-- Lista de espacios de proyecto -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="space in projectSpaces" :key="space.id" class="rounded overflow-hidden shadow-lg">
          <div class="px-6 py-4 bg-gray-800">
            <div class="flex justify-between items-center mb-2">
              <span class="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2">ID: {{ space.short_id }}</span>
              <div class="relative">
                <button class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu absolute right-0 mt-2 py-2 w-48 bg-gray-700 rounded-md shadow-xl z-10">
                  <li>
                    <button @click="copySpaceId(space)" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white">
                      Copiar ID
                    </button>
                  </li>
                  <li>
                    <button @click="confirmDeleteSpace(space)" class="block px-4 py-2 text-sm text-red-500 hover:bg-gray-600 hover:text-white">
                      Eliminar Espacio
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="font-bold text-white text-xl mb-2">
              <template v-if="editingSpaceId === space.id">
                <input v-model="editingSpaceName" class="bg-gray-600 text-white rounded px-2 py-1"/>
                <button @click="updateSpaceName(space)" class="text-green-500 ml-2"><i class="bi bi-check"></i></button>
                <button @click="cancelEdit" class="text-red-500 ml-1"><i class="bi bi-x"></i></button>
              </template>
              <template v-else>
                {{ space.name }}
                <button @click="editSpace(space)" class="text-blue-300 ml-2"><i class="bi bi-pencil"></i></button>
              </template>
            </div>
            <p class="text-gray-400 text-sm">
              <i class="bi bi-calendar mr-1"></i> {{ formatDate(space.created_at) }}
            </p>
            <span class="inline-block bg-blue-500 rounded-full px-3 py-1 text-sm font-semibold text-white mt-2">
              {{ getFilesCount(space.id) }} archivos
            </span>
          </div>
          <div class="px-6 py-4 bg-gray-900">
            <div class="flex justify-between">
              <button @click="openSpace(space)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Ver Proyecto
              </button>
              <button @click="confirmDeleteSpace(space)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <button @click="openWithSidebar(space)" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
              <i class="bi bi-list-ul mr-2"></i> Abrir Espacio en Editor
            </button>
          </div>
          <div class="px-6 py-4 bg-gray-800">
            <button @click="shareProjectSpace(space)" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" title="Compartir espacio">
              <i class="bi bi-share mr-2"></i> Compartir
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay espacios -->
      <div v-if="projectSpaces.length === 0" class="text-center mt-8">
        <div class="bg-gray-700 border-l-4 border-blue-500 text-blue-100 p-4">
          <p>No tienes espacios de proyecto. Crea uno nuevo usando el botón superior.</p>
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div class="modal fade" id="newSpaceModal" tabindex="-1" ref="newSpaceModalRef">
      <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-white">
          <div class="modal-header bg-gray-700">
            <h5 class="modal-title">Nuevo Espacio de Proyecto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="spaceName" class="form-label">Nombre del Espacio</label>
              <input
                type="text"
                class="form-control bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                id="spaceName"
                v-model="newSpaceName"
                placeholder="Ingrese un nombre para el espacio"
              >
            </div>
          </div>
          <div class="modal-footer bg-gray-700">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createSpace"
              :disabled="isCreating"
            >
              {{ isCreating ? 'Creando...' : 'Crear Espacio' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para espacio abierto -->
    <div class="modal fade" id="spaceModal" tabindex="-1" ref="spaceModalRef">
      <div class="modal-dialog modal-xl">
        <div class="modal-content bg-gray-800 text-white">
          <div class="modal-header bg-gray-700">
            <h5 class="modal-title">{{ currentSpace?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="flex justify-between mb-3">
              <button @click="showNewFileModal" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                <i class="bi bi-plus-circle mr-2"></i> Nuevo Archivo
              </button>
            </div>
            
            <!-- Lista de archivos -->
            <div class="divide-y divide-gray-700">
              <div v-for="file in currentSpaceFiles" :key="file.id" 
                   class="py-3 px-4 flex justify-between items-center hover:bg-gray-700">
                <div class="text-purple-500 hover:text-white">
                  <i class="bi bi-file-earmark-code mr-2"></i>
                  {{ file.name }}
                </div>
                <div class="space-x-2">
                  <button @click="openFile(file)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button @click="confirmDeleteFile(file)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    <i class="bi bi-trash"></i>
                  </button>
                  <button @click="shareFile(file)" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    <i class="bi bi-share"></i> Compartir
                  </button>
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay archivos -->
            <div v-if="currentSpaceFiles.length === 0" class="text-center mt-3">
              <p class="text-gray-400">No hay archivos en este espacio. Crea uno nuevo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo archivo -->
    <div class="modal fade" id="newFileModal" tabindex="-1" ref="newFileModalRef">
      <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-white">
          <div class="modal-header bg-gray-700">
            <h5 class="modal-title">Nuevo Archivo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="fileName" class="form-label">Nombre del Archivo</label>
              <input
                type="text"
                class="form-control bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                id="fileName"
                v-model="newFileName"
                placeholder="Ingrese un nombre para el archivo"
              >
            </div>
          </div>
          <div class="modal-footer bg-gray-700">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createFile"
              :disabled="isCreatingFile"
            >
              {{ isCreatingFile ? 'Creando...' : 'Crear Archivo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalRef">
      <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-white">
          <div class="modal-header bg-gray-700">
            <h5 class="modal-title">Confirmar eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p v-if="itemToDelete?.type === 'space'">
              ¿Estás seguro que deseas eliminar el espacio "<strong>{{ itemToDelete.item.name }}</strong>"?
              <br>
              <small class="text-red-500">Esta acción eliminará todos los archivos dentro del espacio.</small>
            </p>
            <p v-else>
              ¿Estás seguro que deseas eliminar el archivo "<strong>{{ itemToDelete?.item.name }}</strong>"?
            </p>
          </div>
          <div class="modal-footer bg-gray-700">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteItem"
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de copia exitosa -->
    <div
      class="fixed bottom-0 right-0 m-3 bg-green-500 text-white py-2 px-4 rounded shadow-md transition-opacity duration-300 ease-in-out"
      :class="{ 'opacity-100': showCopyToast, 'opacity-0': !showCopyToast }"
      style="z-index: 1050"
    >
      <div class="flex items-center justify-between">
        <strong class="mr-4">ID Copiado</strong>
        <button type="button" class="ml-auto text-white hover:text-gray-200 focus:outline-none" @click="showCopyToast = false">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="mt-1 text-sm">ID del espacio copiado al portapapeles.</div>
    </div>
    
    <!-- Modal para compartir -->
    <div class="modal fade" id="shareModal" tabindex="-1" ref="shareModalRef">
      <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-dark">
          <div class="modal-header bg-gray-700">
            <h5 class="modal-title text-white">Compartir Proyecto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
            <div class="modal-body">
            <div class="mb-3">
              <label class="form-label text-dark">Link del proyecto:</label>
              <div class="input-group">
              <input type="text" class="form-control bg-gray-700 text-dark border-gray-600 focus:ring-blue-500 focus:border-blue-500" :value="shareUrl" readonly ref="shareUrlInput">
              <button class="btn btn-outline-secondary" @click="copyShareUrl">
                <i class="bi bi-clipboard"></i>
              </button>
              </div>
            </div>
            <div class="d-grid gap-2">
              <a :href="whatsappShareUrl" target="_blank" class="btn btn-success">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
              </a>
            </div>
            <div v-if="qrCodeUrl" class="text-center mt-3">
              <p class="text-dark">Escanea este código QR para compartir:</p>
              <img :src="qrCodeUrl" alt="QR Code" class="img-fluid mx-auto d-block">
            </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { supabase } from '../supabase';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { Modal } from 'bootstrap';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const router = useRouter();
const toast = useToast();

// Referencias a modales
const newSpaceModalRef = ref(null);
const spaceModalRef = ref(null);
const newFileModalRef = ref(null);
const deleteModalRef = ref(null);
const shareModalRef = ref(null);
const shareUrlInput = ref(null)

// Estado
const projectSpaces = ref([]);
const currentSpace = ref(null);
const currentSpaceFiles = ref([]);
const newSpaceName = ref('');
const newFileName = ref('');
const isCreating = ref(false);
const isCreatingFile = ref(false);
const isDeleting = ref(false);
const showCopyToast = ref(false);
const itemToDelete = ref(null);
const selectedSpace = ref(null);
const shareId = ref(null);
const isLoading = ref(false);
const error = ref(null);

const shareUrl = computed(() => {
  if (!currentSpace.value) return '';

  // Serialize project space data
  const projectSpaceData = {
    name: currentSpace.value.name,
    files: currentSpaceFiles.value.map(file => ({
      name: file.name,
      code: file.code
    }))
  };

  // Encode the data
  const encodedData = encodeURIComponent(JSON.stringify(projectSpaceData));

  // Create the URL
  return `${window.location.origin}/projects?project_space_data=${encodedData}`;
});

const whatsappShareUrl = computed(() => {
  if (!shareUrl.value) return ''
  const text = `¡Mira mi proyecto de C#!\n${shareUrl.value}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
})

let spaceModal = null;
let newSpaceModal = null;
let newFileModal = null;
let deleteModal = null;
let shareModal = null;

const qrCodeUrl = ref('');

onMounted(async () => {
  await loadProjectSpaces();
  
  nextTick(() => {
    // Inicializar modales
    if (newSpaceModalRef.value) {
      newSpaceModal = new Modal(newSpaceModalRef.value);
    } else {
      console.error('newSpaceModalRef is not initialized');
    }
    if (spaceModalRef.value) {
      spaceModal = new Modal(spaceModalRef.value);
    } else {
      console.error('spaceModalRef is not initialized');
    }
    if (newFileModalRef.value) {
      newFileModal = new Modal(newFileModalRef.value);
    } else {
      console.error('newFileModalRef is not initialized');
    }
    if (deleteModalRef.value) {
      deleteModal = new Modal(deleteModalRef.value);
    } else {
      console.error('deleteModalRef is not initialized');
    }
    if (shareModalRef.value) {
      shareModal = new Modal(shareModalRef.value);
    } else {
      console.error('shareModalRef is not initialized');
    }
  })
});

const loadProjectSpaces = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Debes iniciar sesión para ver tus espacios de proyecto');
      return;
    }

    const { data, error } = await supabase
      .from('project_spaces')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    projectSpaces.value = data || [];
  } catch (error) {
    toast.error('Error al cargar los espacios: ' + error.message);
  }
};

const loadSpaceFiles = async (spaceId) => {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_space_id', spaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    currentSpaceFiles.value = data || [];
  } catch (error) {
    toast.error('Error al cargar los archivos: ' + error.message);
  }
};

const showNewSpaceModal = () => {
  newSpaceName.value = '';
  if (newSpaceModal) {
    newSpaceModal.show();
  } else {
    console.error('newSpaceModal is not initialized');
  }
};
  

const createSpace = async () => {
  if (!newSpaceName.value.trim()) {
    toast.error('Por favor ingrese un nombre para el espacio');
    return;
  }

  try {
    isCreating.value = true;
    const { data: { user } } = await supabase.auth.getUser();
    
    const shortId = generateShortId();
    const { data, error } = await supabase
      .from('project_spaces')
      .insert([{
        name: newSpaceName.value.trim(),
        user_id: user.id,
        short_id: shortId
      }])
      .select();

    if (error) throw error;

    projectSpaces.value.unshift(data[0]);
    newSpaceModal.hide();
    toast.success('Espacio creado exitosamente');
  } catch (error) {
    toast.error('Error al crear el espacio: ' + error.message);
  } finally {
    isCreating.value = false;
  }
};

const openSpace = async (space) => {
  try {
    // Recuperar la funcionalidad original
    currentSpace.value = space;
    await loadSpaceFiles(space.id);
    
    // Mostrar el modal de espacio (como hacía originalmente)
    if (spaceModal) {
      spaceModal.show();
    } else {
      console.error('spaceModal is not initialized');
    }
    
    // Omitimos la redirección aquí para mantener la funcionalidad original
    // La redirección ahora solo ocurre con el nuevo botón "Ver Archivos en Barra Lateral"
  } catch (error) {
    toast.error('Error al abrir el espacio: ' + error.message);
  }
};

const showNewFileModal = () => {
  newFileName.value = '';
   if (newFileModal) {
    newFileModal.show();
  } else {
    console.error('newFileModal is not initialized');
  }
};

const createFile = async () => {
  if (!newFileName.value.trim()) {
    toast.error('Por favor ingrese un nombre para el archivo');
    return;
  }

  try {
    isCreatingFile.value = true;
    const { data, error } = await supabase
      .from('project_files')
      .insert([{
        name: newFileName.value.trim(),
        code: '// Tu código C# aquí\n',
        project_space_id: currentSpace.value.id
      }])
      .select();

    if (error) throw error;

    currentSpaceFiles.value.unshift(data[0]);
    newFileModal.hide();
    toast.success('Archivo creado exitosamente');
  } catch (error) {
    toast.error('Error al crear el archivo: ' + error.message);
  } finally {
    isCreatingFile.value = false;
  }
};

const openFile = (file) => {
   // Cerrar el modal
  if (spaceModalRef.value) {
    const modalInstance = Modal.getInstance(spaceModalRef.value)
    if (modalInstance) {
      modalInstance.hide()
    }
  } ;
  router.push({
    path: '/',
    query: { fileId: file.id }
  });
};

const confirmDeleteSpace = (space) => {
  itemToDelete.value = { type: 'space', item: space };
  if (deleteModal) {
    deleteModal.show();
  } else {
    console.error('deleteModal is not initialized');
  }
};

const confirmDeleteFile = (file) => {
  itemToDelete.value = { type: 'file', item: file };
   if (deleteModal) {
    deleteModal.show();
  } else {
    console.error('deleteModal is not initialized');
  }
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;

  try {
    isDeleting.value = true;
    const { type, item } = itemToDelete.value;

    if (type === 'space') {
      const { error } = await supabase
        .from('project_spaces')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      projectSpaces.value = projectSpaces.value.filter(s => s.id !== item.id);
      toast.success('Espacio eliminado exitosamente');
    } else {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      currentSpaceFiles.value = currentSpaceFiles.value.filter(f => f.id !== item.id);
      toast.success('Archivo eliminado exitosamente');
    }

    deleteModal.hide();
  } catch (error) {
    toast.error('Error al eliminar: ' + error.message);
  } finally {
    isDeleting.value = false;
    itemToDelete.value = null;
  }
};

const copySpaceId = async (space) => {
  try {
    await navigator.clipboard.writeText(space.short_id);
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 3000);
  } catch (err) {
    toast.error('Error al copiar: ' + err.message);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getFilesCount = (spaceId) => {
  return currentSpaceFiles.value.filter(f => f.project_space_id === spaceId).length;
};

const generateShortId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const shareProjectSpace = async (space) => {
  currentSpace.value = space

  // Generate QR code
  QRCode.toDataURL(shareUrl.value)
    .then(url => {
      qrCodeUrl.value = url;
    })
    .catch(err => {
      console.error('Error generating QR code:', err);
      toast.error('Error al generar el código QR');
    });

  // Usar JavaScript vanilla para mostrar el modal
  const modalElement = document.getElementById('shareModal');
  if (modalElement) {
    const shareModalInstance = Modal.getInstance(modalElement);
    shareModalInstance.show();
  } else {
    toast.error('No se encontró el elemento del modal');
  }
};

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    toast.success('Link copiado al portapapeles');
  } catch (err) {
    toast.error('Error al copiar: ' + err.message);
  }
};

const shareFile = async (file) => {
  try {
    // Fetch user information
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Generate a unique share ID
    shareId.value = uuidv4();

    // Insert into shared_files table
    const { error: shareError } = await supabase
      .from('shared_files')
      .insert([
        {
          id: shareId.value,
          file_id: file.id,
          name: file.name,
          code: file.code,
          shared_by: user.id,
        },
      ]);

    if (shareError) {
      toast.error('Error sharing file: ' + shareError.message);
      return;
    }

    // Generate the share URL
    const shareURL = `${window.location.origin}/?shared_file_id=${shareId.value}`;

    // Copy the share URL to the clipboard
    await navigator.clipboard.writeText(shareURL);
    toast.success('Link copiado al portapapeles');
  } catch (error) {
    toast.error('Error al compartir: ' + error.message);
  }
};

const openWithSidebar = (space) => {
  // Redirigir al editor con el ID del proyecto y un indicador para abrir la barra lateral
  router.push({
    path: '/',
    query: { 
      projectId: space.id,
      showSidebar: true
    }
  });
};

// Variables para edición del nombre del espacio
const editingSpaceId = ref(null);
const editingSpaceName = ref('');

// Función para iniciar edición
const editSpace = (space) => {
  editingSpaceId.value = space.id;
  editingSpaceName.value = space.name;
};

// Función para cancelar edición
const cancelEdit = () => {
  editingSpaceId.value = null;
  editingSpaceName.value = '';
};

// Función para actualizar el nombre del espacio en Supabase
const updateSpaceName = async (space) => {
  if (!editingSpaceName.value.trim()) {
    toast.error('El nombre no puede estar vacío');
    return;
  }
  try {
    const { error } = await supabase
      .from('project_spaces')
      .update({ name: editingSpaceName.value.trim() })
      .eq('id', space.id);
    if (error) throw error;
    // Actualizar localmente en projectSpaces
    const index = projectSpaces.value.findIndex(s => s.id === space.id);
    if (index !== -1) {
      projectSpaces.value[index].name = editingSpaceName.value.trim();
    }
    cancelEdit();
    toast.success('Nombre actualizado exitosamente');
  } catch (error) {
    toast.error('Error al actualizar el nombre: ' + error.message);
  }
};
</script>

<style scoped>
.project-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.project-card.selected {
  border: 2px solid #007bff; /* Highlight selected card */
}

.modal {
  transition: opacity 0.15s linear;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.toast {
  transition: opacity 0.15s linear;
  opacity: 0;
}

.toast.show {
  opacity: 1;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  background-color: white;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>
