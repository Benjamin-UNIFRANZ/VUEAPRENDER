<template>
  <div class="container">
    <div v-if="isLoading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Espacios de Proyecto</h2>
        <button @click="showNewSpaceModal" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Nuevo Espacio
        </button>
      </div>

      <!-- Lista de espacios de proyecto -->
      <div class="row">
        <div v-for="space in projectSpaces" :key="space.id" class="col-md-4 mb-4">
          <div class="card project-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span class="badge bg-secondary">ID: {{ space.short_id }}</span>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button @click="copySpaceId(space)" class="dropdown-item">
                      Copiar ID
                    </button>
                  </li>
                  <li>
                    <button @click="confirmDeleteSpace(space)" class="dropdown-item text-danger">
                      Eliminar Espacio
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ space.name }}</h5>
              <div class="mb-2">
                <small class="text-muted">
                  <i class="bi bi-calendar"></i> {{ formatDate(space.created_at) }}
                </small>
              </div>
              <div class="mb-3">
                <span class="badge bg-info">
                  {{ getFilesCount(space.id) }} archivos
                </span>
              </div>
              <div class="d-flex gap-2 mb-2">
                <button @click="openSpace(space)" class="btn btn-primary flex-grow-1">
                  Abrir Espacio
                </button>
                <button @click="confirmDeleteSpace(space)" class="btn btn-outline-danger">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="d-flex">
                <button @click="openWithSidebar(space)" class="btn btn-secondary w-100">
                  <i class="bi bi-list-ul"></i> Ver Archivos en Barra Lateral
                </button>
              </div>
            </div>
            <div class="card-footer">
              <button @click="shareProjectSpace(space)" class="btn btn-info btn-sm w-100" title="Compartir espacio">
                <i class="bi bi-share"></i> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay espacios -->
      <div v-if="projectSpaces.length === 0" class="col-12 text-center">
        <div class="alert alert-info">
          No tienes espacios de proyecto. Crea uno nuevo usando el botón superior.
        </div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div class="modal fade" id="newSpaceModal" tabindex="-1" ref="newSpaceModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Espacio de Proyecto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="spaceName" class="form-label">Nombre del Espacio</label>
              <input
                type="text"
                class="form-control"
                id="spaceName"
                v-model="newSpaceName"
                placeholder="Ingrese un nombre para el espacio"
              >
            </div>
          </div>
          <div class="modal-footer">
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
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ currentSpace?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between mb-3">
              <button @click="showNewFileModal" class="btn btn-success">
                <i class="bi bi-plus-circle"></i> Nuevo Archivo
              </button>
            </div>
            
            <!-- Lista de archivos -->
            <div class="list-group">
              <div v-for="file in currentSpaceFiles" :key="file.id" 
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div>
                  <i class="bi bi-file-earmark-code me-2"></i>
                  {{ file.name }}
                </div>
                <div class="btn-group">
                  <button @click="openFile(file)" class="btn btn-sm btn-primary">
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button @click="confirmDeleteFile(file)" class="btn btn-sm btn-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                  <button @click="shareFile(file)" class="btn btn-sm btn-info">
                    <i class="bi bi-share"></i> Compartir
                  </button>
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay archivos -->
            <div v-if="currentSpaceFiles.length === 0" class="text-center mt-3">
              <p class="text-muted">No hay archivos en este espacio. Crea uno nuevo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo archivo -->
    <div class="modal fade" id="newFileModal" tabindex="-1" ref="newFileModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Archivo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="fileName" class="form-label">Nombre del Archivo</label>
              <input
                type="text"
                class="form-control"
                id="fileName"
                v-model="newFileName"
                placeholder="Ingrese un nombre para el archivo"
              >
            </div>
          </div>
          <div class="modal-footer">
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
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar eliminación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p v-if="itemToDelete?.type === 'space'">
              ¿Estás seguro que deseas eliminar el espacio "<strong>{{ itemToDelete.item.name }}</strong>"?
              <br>
              <small class="text-danger">Esta acción eliminará todos los archivos dentro del espacio.</small>
            </p>
            <p v-else>
              ¿Estás seguro que deseas eliminar el archivo "<strong>{{ itemToDelete?.item.name }}</strong>"?
            </p>
          </div>
          <div class="modal-footer">
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
      class="toast position-fixed bottom-0 end-0 m-3"
      :class="{ show: showCopyToast }"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style="z-index: 1050"
    >
      <div class="toast-header bg-success text-white">
        <strong class="me-auto">ID Copiado</strong>
        <button type="button" class="btn-close btn-close-white" @click="showCopyToast = false"></button>
      </div>
      <div class="toast-body">ID del espacio copiado al portapapeles.</div>
    </div>
    
    <!-- Modal para compartir -->
    <div class="modal fade" id="shareModal" tabindex="-1" ref="shareModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Compartir Proyecto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Link del proyecto:</label>
              <div class="input-group">
                <input type="text" class="form-control" :value="shareUrl" readonly ref="shareUrlInput">
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
              <p>Escanea este código QR para compartir:</p>
              <img :src="qrCodeUrl" alt="QR Code" class="img-fluid">
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
  const modalElement = document.querySelector('#shareModalRef');
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