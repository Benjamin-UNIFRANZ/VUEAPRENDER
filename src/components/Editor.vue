<template>
  <div class="min-h-screen bg-gray-900 text-white py-0 px-0">
    <div class="w-full h-full">
      <!-- Panel de proyecto, Editor y JDoodle en una sola fila -->
      <div class="flex h-full ">
        <!-- Panel de proyecto (izquierda) -->
        <div class="p-2 h-full w-2/8">
          <h5 class="text-lg font-semibold mb-3">Proyecto</h5>
          <!-- Botón para ver todos los proyectos -->
          <div class="mb-3">
            <button @click="goToProjects" class="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded">
              <i class="bi bi-folder mr-2"></i> Ver todos mis proyectos
            </button>
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-300">Abrir Proyecto</label>
            <select class="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white" v-model="selectedProject" @change="handleProjectChange">
              <option :value="null">Selecciona un proyecto</option>
              <option v-for="space in projectSpaces" :key="space.id" :value="space.id">
          {{ space.name }}
              </option>
            </select>
          </div>

          <div v-if="currentProject">
            <h6 class="text-md font-semibold">{{ currentProject.name }}</h6>

            <!-- Formulario para nuevo archivo -->
            <div class="mb-3">
              <label for="newFileName" class="block text-sm font-medium text-gray-300">Nuevo Archivo</label>
              <div class="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            class="flex-1 block w-full rounded-none rounded-l-md border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 bg-gray-700"
            id="newFileName"
            v-model="newFileName"
            placeholder="Nombre del archivo"
          >
          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
            @click="createFile"
            :disabled="isCreatingFile"
          >
            <i class="bi bi-plus-circle"></i>
          </button>
              </div>
            </div>

            <ul class="list-none p-0">
              <li v-for="file in projectFiles" :key="file.id" class="py-2 px-4 rounded-md flex justify-between items-center bg-gray-700 mb-2">
            <div class="flex-1">       
            {{ file.name }}
            </div>
          <div class="flex space-x-1">
            <button @click="openFile(file)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
              <i class="bi bi-pencil"></i>
            </button>
            <button @click="confirmDeleteFile(file)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
              <i class="bi bi-trash"></i>
            </button>
            <button @click="shareFile(file)" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">
              <i class="bi bi-share"></i>
            </button>
          </div>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-gray-400">Selecciona un proyecto para ver sus archivos.</p>
          </div>
        </div>

        <!-- Editor y JDoodle (derecha) -->
        <div class="w-7/8 flex h-full">
          <!-- Editor (izquierda) -->
          <div class="w-5/8 p-1 h-full">
            <div class="h-full">
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded-t-lg">
          <div class="flex items-center">
            <h5 class="text-lg font-semibold mr-3">Editor C#</h5>
            <div class="flex rounded-md shadow-sm">
              <input
                type="text"
                class="flex-1 block w-full rounded-none rounded-l-md border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 bg-gray-700"
                v-model="currentFileName"
                :readonly="!fileId"
                placeholder="Nombre del archivo"
              >
              <button
                v-if="fileId"
                @click="updateFileName"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
                :disabled="isUpdatingFileName"
              >
                <i class="bi bi-check"></i>
              </button>
            </div>
          </div>
          <div class="space-x-2">
            <button
              v-if="!fileId"
              @click="showNewFileModal"
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <i class="bi bi-plus-circle mr-2"></i> Nuevo Archivo
            </button>
            <button
              v-if="fileId"
              @click="updateCode"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Actualizar Archivo
            </button>
            <button v-if="sharedFileId" @click="showSaveToProjectModal" class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
              Guardar en Proyecto
            </button>
          </div>
              </div>
  
            <div class="relative">
            <button
              @click="copyCodeToClipboard"
              class="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm copy-button"
            >
              <i class="bi bi-clipboard"></i> Copiar
            </button>
            <Codemirror
              v-model="code"
              placeholder="Write your C# code here..."
              :style="{ height: '1000px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tabSize="2"
              :extensions="extensions"
            />
            </div>

            </div>
          </div>

          <!-- JDoodle iframe (derecha) -->
          <div class="w-3/8 p-0">
            <div class="bg-gray-800 rounded-lg shadow-md">
              <div class="p-1 bg-gray-700 rounded-t-lg flex items-center justify-between">
                <h5 class="text-lg font-semibold">JDoodle C# Online</h5>
                <div>
                  <button @click="reloadJdoodle" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm">
                    <i class="bi bi-arrow-clockwise"></i> Recargar
                  </button>
                </div>
              </div>
              <div class="p-0">
                <div class="bg-blue-900 text-white p-3 rounded mb-3" v-if="showJdoodleHelp">
                  <h5 class="font-semibold">¿Cómo usar JDoodle?</h5>
                  <ol class="list-decimal pl-5">
                    <li>Haz clic en "Copiar" en el editor superior</li>
                    <li>Pega el código en el editor de JDoodle</li>
                    <li>Haz clic en "Execute" para ejecutar el código</li>
                  </ol>
                  <button @click="showJdoodleHelp = false" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm mt-2">Entendido</button>
                </div>
                <iframe
                  ref="jdoodleFrame"
                  src="https://www.jdoodle.com/compile-c-sharp-online/"
                  style="width: 100%; height: 1000px; border: none;"
                  @load="onJdoodleLoad"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Modales -->
      <!-- New Project Modal -->
      <div class="modal fade" id="newProjectModal" tabindex="-1" ref="newProjectModalRef">
        <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-black">
        <div class="modal-header bg-gray-700">
        <h5 class="modal-title text-black">Nuevo Proyecto</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Nombre del Espacio</label>
          <input
          type="text"
          class="form-control bg-gray-700 text-black border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          v-model="newProjectName"
          placeholder="Ingrese un nombre para el espacio"
          >
        </div>
        <div class="mb-3">
          <label class="form-label">Nombre del Archivo</label>
          <input
          type="text"
          class="form-control bg-gray-700 text-black border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          v-model="newFileName"
          placeholder="Ingrese un nombre para el archivo inicial"
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
          @click="createNewProject"
          :disabled="isCreatingProject"
        >
          {{ isCreatingProject ? 'Creando...' : 'Crear Proyecto' }}
        </button>
        </div>
        </div>
        </div>
      </div>

      <!-- Save to Project Modal -->
      <div class="modal fade" id="saveToProjectModal" tabindex="-1" ref="saveToProjectModalRef">
        <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-black">
        <div class="modal-header bg-gray-700">
        <h5 class="modal-title text-black">Guardar en Proyecto</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
        <p>Selecciona un espacio de proyecto para guardar el archivo:</p>
        <select class="form-select bg-gray-700 text-black border-gray-600 focus:ring-blue-500 focus:border-blue-500" v-model="selectedProjectSpace">
          <option v-for="space in projectSpaces" :key="space.id" :value="space.id">
          {{ space.name }}
          </option>
        </select>
        </div>
        <div class="modal-footer bg-gray-700">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="saveToProject">
          Guardar
        </button>
        </div>
        </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalRef">
        <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-black">
        <div class="modal-header bg-gray-700">
        <h5 class="modal-title text-black">Confirmar eliminación</h5>
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

      <!-- Modal para compartir -->
      <div class="modal fade" id="shareModal" tabindex="-1" ref="shareModalRef">
        <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-black">
        <div class="modal-header bg-gray-700">
        <h5 class="modal-title text-black">Compartir Proyecto</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Link del proyecto:</label>
          <div class="input-group">
          <input type="text" class="form-control bg-gray-700 text-black border-gray-600 focus:ring-blue-500 focus:border-blue-500" :value="shareUrl" readonly ref="shareUrlInput">
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
          <img :src="qrCodeUrl" alt="QR Code" class="img-fluid mx-auto d-block">
        </div>
        </div>
        </div>
        </div>
      </div>

      <!-- Modal para nuevo archivo -->
      <div class="modal fade" id="newFileModal" tabindex="-1" ref="newFileModalRef">
        <div class="modal-dialog">
        <div class="modal-content bg-gray-800 text-black">
        <div class="modal-header bg-gray-700">
        <h5 class="modal-title text-black">Nuevo Archivo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
        <div class="mb-3">
          <label for="modalNewFileName" class="form-label">Nombre del Archivo</label>
          <input
          type="text"
          class="form-control bg-gray-700 text-black border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          id="modalNewFileName"
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

    <!-- Toasts -->
    <!-- Toast de copia exitosa -->
    <div
      class="fixed bottom-0 right-0 m-3 bg-green-500 text-white py-2 px-4 rounded shadow-md transition-opacity duration-300 ease-in-out"
      :class="{ 'opacity-100': showCopyToast, 'opacity-0': !showCopyToast }"
      style="z-index: 1050"
    >
      <div class="flex items-center justify-between">
        <strong class="mr-4">Código Copiado</strong>
        <button type="button" class="ml-auto text-white hover:text-gray-200 focus:outline-none" @click="showCopyToast = false">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="mt-1 text-sm">El código ha sido copiado al portapapeles.</div>
    </div>
  </div>
  
</template>

<script setup>
// ***************** IMPORTANTE: DEFINICIONES CRÍTICAS *******************
// Definimos estas variables al principio absoluto del archivo para evitar problemas de hoisting
import { ref, onMounted, nextTick, computed, watch } from 'vue'
// Definiciones críticas que DEBEN estar aquí arriba
const isCreatingFile = ref(false) // Corregido: definido explícitamente aquí
const pendingOperations = ref([])
const consoleInput = ref(null)
// **********************************************************************

import { Codemirror } from 'vue-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'
import { supabase } from '../supabase'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { 
  convertStringInterpolation, 
  extractVariablesFromCode, 
  evaluateCSharpExpression, 
  transformCSharpToJS, 
  detectCSharpError 
} from './csharpInterpreter'
import { executeCSharpCode, analyzeError } from './utils'
import { transformCSharpToJavaScript } from './parser'
import { executeFullCSharp } from './fullModeInterpreter';
import { analyzeCodeStructure } from './debugHelper';
import { executeSimpleCSharp } from './simpleCSharpRunner';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const toast = useToast()
const route = useRoute()
const router = useRouter()
const code = ref('using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello World!");\n    }\n}')
const output = ref('')
const currentFileName = ref('')
const fileId = ref(null)
const isExecuting = ref(false)
const executionSuccess = ref(true)
const extensions = [cpp(), oneDark]

// New refs for project creation
const newProjectModalRef = ref(null)
const newFileModalRef = ref(null)  // Añadido: referencia para el modal de nuevo archivo
const deleteModalRef = ref(null)
const shareModalRef = ref(null)
const saveToProjectModalRef = ref(null)

// Variables para controlar las modales
let newProjectModal = null
let newFileModal = null
let deleteModal = null
let shareModal = null
let saveToProjectModal = null

const newProjectName = ref('')
const newFileName = ref('')
const isCreatingProject = ref(false)
const isUpdatingFileName = ref(false)

// Console simulation state
const waitingForInput = ref(false)
const userInput = ref('')
const currentPrompt = ref('')
const inputType = ref('text')
const inputPlaceholder = ref('')

// Estado para JDoodle iframe y copia de código
const jdoodleFrame = ref(null)
const showJdoodleHelp = ref(true)
const showCopyToast = ref(false)
const jdoodleFullScreen = ref(false)

// New ref for shareId
const shareId = ref(null)

// Estado para el espacio compartido
const sharedProjectSpaceId = ref(null);
const isLoading = ref(false);
const error = ref(null);
const isSaving = ref(false);

// New state for shared files
const sharedFileId = ref(null);
const projectSpaces = ref([]);
const selectedProjectSpace = ref(null);

// Initialize modals
const itemToDelete = ref(null)
const isDeleting = ref(false)
const qrCodeUrl = ref('');
const shareUrlInput = ref(null);

const shareUrl = computed(() => {
  if (!currentProject.value) return '';

  // Serialize project space data
  const projectSpaceData = {
    name: currentProject.value.name,
    files: projectFiles.value.map(file => ({
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

const onJdoodleLoad = () => {
  // Enviar el código al iframe de JDoodle cuando se carga
  sendCodeToJdoodle()
}

const sendCodeToJdoodle = () => {
  if (jdoodleFrame.value && jdoodleFrame.value.contentWindow) {
    jdoodleFrame.value.contentWindow.postMessage({
      action: 'paste',
      code: code.value
    }, 'https://www.jdoodle.com')
  }
}

const reloadJdoodle = () => {
  jdoodleFrame.value.src = jdoodleFrame.value.src // Forzar la recarga del iframe
  showJdoodleHelp.value = true // Mostrar la ayuda de nuevo al recargar
}

const toggleFullScreen = () => {
  jdoodleFullScreen.value = !jdoodleFullScreen.value
}

// Modificar la inicialización del modal
onMounted(async () => {
  // Esperar al siguiente tick para asegurar que el DOM está listo
  await nextTick()
  
  // Initialize modals
  if (newProjectModalRef.value) {
    newProjectModal = new Modal(newProjectModalRef.value)
  }

  if (saveToProjectModalRef.value) {
    saveToProjectModal = new Modal(saveToProjectModalRef.value);
  }

  if (deleteModalRef.value) {
    deleteModal = new Modal(deleteModalRef.value)
  }

  if (shareModalRef.value) {
    shareModal = new Modal(shareModalRef.value)
  }
  
  if (newFileModalRef.value) {
    newFileModal = new Modal(newFileModalRef.value)
  }

  await loadProjectSpaces();

  // Load file if fileId is provided
  if (route.query.fileId) {
    await loadFile(route.query.fileId)
  } else if (route.query.shared_file_id) {
    sharedFileId.value = route.query.shared_file_id;
    await loadSharedFile();
  } else  if (route.query.shared_project_space_id) {
    sharedProjectSpaceId.value = route.query.shared_project_space_id;
    await loadSharedProjectSpace();
  } else if (route.query.projectId) {
    selectedProject.value = route.query.projectId;
  }
})

const loadFile = async (id) => {
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (data) {
      code.value = data.code
      currentFileName.value = data.name
      fileId.value = data.id
    }
  } catch (error) {
    toast.error('Error cargando archivo: ' + error.message)
  }
}

const showNewProjectModal = () => {
  newProjectName.value = ''
  newFileName.value = ''
  newProjectModal.show()
}

const createNewProject = async () => {
  if (!newProjectName.value.trim() || !newFileName.value.trim()) {
    toast.error('Por favor complete todos los campos')
    return
  }

  try {
    isCreatingProject.value = true

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Create project space
    const { data: spaceData, error: spaceError } = await supabase
      .from('project_spaces')
      .insert([{
        name: newProjectName.value.trim(),
        short_id: generateShortId(),
        user_id: user.id // Add the user_id
      }])
      .select()

    if (spaceError) throw spaceError

    // Create initial file
    const { data: fileData, error: fileError } = await supabase
      .from('project_files')
      .insert([{
        name: newFileName.value.trim(),
        code: code.value,
        project_space_id: spaceData[0].id
      }])
      .select()

    if (fileError) throw fileError

    // Update local state
    fileId.value = fileData[0].id // Set fileId here
    currentFileName.value = fileData[0].name

    newProjectModal.hide()
    toast.success('Proyecto creado exitosamente')

    // Navigate to the new file
    router.push({
      path: '/',
      query: { fileId: fileData[0].id }
    })
  } catch (error) {
    toast.error('Error creando proyecto: ' + error.message)
  } finally {
    isCreatingProject.value = false
  }
}

const updateFileName = async () => {
  if (!fileId.value || !currentFileName.value.trim()) {
    toast.error('Nombre de archivo inválido')
    return
  }

  try {
    isUpdatingFileName.value = true

    const { error } = await supabase
      .from('project_files')
      .update({ name: currentFileName.value.trim() })
      .eq('id', fileId.value)

    if (error) throw error

    toast.success('Nombre actualizado exitosamente')
  } catch (error) {
    toast.error('Error actualizando nombre: ' + error.message)
    // Restore previous name
    const { data } = await supabase
      .from('project_files')
      .select('name')
      .eq('id', fileId.value)
      .single()
    if (data) {
      currentFileName.value = data.name
    }
  } finally {
    isUpdatingFileName.value = false
  }
}

const generateShortId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const updateCode = async () => {
    if (!fileId.value) {
        toast.error('No file selected');
        return;
    }

    try {
        // Actualizar tanto el código como el nombre del archivo
        const { error } = await supabase
            .from('project_files')
            .update({ 
                code: code.value,
                name: currentFileName.value.trim() 
            })
            .eq('id', fileId.value);

        if (error) throw error;

        toast.success('Archivo actualizado exitosamente');
    } catch (error) {
        toast.error('Error al actualizar el archivo: ' + error.message);
    }
};

const simulateConsoleReadLine = async (prompt = '', type = 'text', placeholder = '') => {
  currentPrompt.value = prompt
  inputType.value = type
  inputPlaceholder.value = placeholder
  waitingForInput.value = true
  userInput.value = ''

  await nextTick()
  consoleInput.value?.focus()

  return new Promise((resolve) => {
    pendingOperations.value.push(resolve)
  })
}

const handleUserInput = async () => {
  if (!waitingForInput.value || pendingOperations.value.length === 0) return

  const value = userInput.value
  output.value += currentPrompt.value + value + '\n'
  waitingForInput.value = false
  userInput.value = ''

  const resolve = pendingOperations.value.shift()
  resolve(value)
}

const runCode = async () => {
  try {
    isExecuting.value = true;
    executionSuccess.value = true;
    output.value = '';
    pendingOperations.value = [];
    
    const virtualConsole = {
      WriteLine: async (text) => {
        output.value += String(text) + '\n';
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      },
      Write: async (text) => {
        output.value += String(text);
        await new Promise(resolve => setTimeout(resolve, 10));
        return true;
      },
      ReadLine: async (prompt = '') => {
        if (prompt) await virtualConsole.Write(prompt);
        const input = await simulateConsoleReadLine('');
        return input;
      },
      ReadNumber: async (prompt = '') => {
        if (prompt) await virtualConsole.Write(prompt);
        const input = await simulateConsoleReadLine('', 'number', 'Enter a number');
        return Number(input);
      },
      Clear: () => {
        output.value = '';
        return true;
      }
    };
    
    await virtualConsole.WriteLine("Ejecutando código C#...\n");
    
    try {
      const hasLoops = code.value.includes('for (') || code.value.includes('while (');
      const hasConsoleOps = code.value.includes('Console.WriteLine') || code.value.includes('Console.ReadLine');
      
      if (hasLoops && hasConsoleOps) {
        await executeSimpleCSharp(code.value, virtualConsole);
      } else {
        await executeFullCSharp(code.value, virtualConsole);
      }
    } catch (error) {
      await virtualConsole.WriteLine(`\n[Error: ${error.message}]`);
      await virtualConsole.WriteLine("[Intentando con modo alternativo...]\n");
      
      try {
        await executeFullCSharp(code.value, virtualConsole);
      } catch (error2) {
        await virtualConsole.WriteLine(`\n[Error en intérprete: ${error2.message}]`);
        await virtualConsole.WriteLine("[Ejecutando en modo básico]\n");
        
        const consoleRegex = /Console\.WriteLine\(\s*"([^"]*)"\s*\);/g;
        let match;
        
        while ((match = consoleRegex.exec(code.value)) !== null) {
          await virtualConsole.WriteLine(match[1]);
        }
      }
    }
    
    toast.success('Código ejecutado');
  } catch (error) {
    executionSuccess.value = false;
    await new Promise(resolve => setTimeout(resolve, 10));
    output.value += `\nError: ${error.message}\n`;
    toast.error('Error al ejecutar el código');
  } finally {
    isExecuting.value = false;
    waitingForInput.value = false;
  }
};

const clearOutput = () => {
  output.value = ''
  executionSuccess.value = true
  waitingForInput.value = false
  pendingOperations.value = []
}

const loadSharedProjectSpace = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Debes iniciar sesión para guardar este espacio en tus proyectos');
      router.push('/auth');
      return;
    }

    const { data, error: sharedError } = await supabase
      .from('shared_project_spaces')
      .select('project_space_id')
      .eq('id', sharedProjectSpaceId.value)
      .single();

    if (sharedError) {
      throw sharedError;
    }

    if (!data) {
      error.value = 'Shared project space not found';
      return;
    }

    // Copy the shared project space to the user's account
    await saveToMyProjects(data.project_space_id);

  } catch (fetchError) {
    error.value = fetchError.message;
    toast.error('Error loading shared project space: ' + fetchError.message);
  } finally {
    isLoading.value = false;
  }
};

const saveToMyProjects = async (sharedProjectSpaceId) => {
  try {
    isSaving.value = true;

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Fetch the shared project space details
    const { data: projectSpaceData, error: projectSpaceError } = await supabase
      .from('project_spaces')
      .select('*')
      .eq('id', sharedProjectSpaceId)
      .single();

    if (projectSpaceError) throw projectSpaceError;

    if (!projectSpaceData) {
      toast.error('Project space not found');
      return;
    }

    // Create a new project space for the user
    const { data: newSpaceData, error: newSpaceError } = await supabase
      .from('project_spaces')
      .insert([{
        name: projectSpaceData.name + ' (Copia)',
        short_id: generateShortId(),
        user_id: user.id
      }])
      .select()
      .single();

    if (newSpaceError) throw newSpaceError;

    // Fetch the files from the shared project space
    const { data: filesData, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_space_id', sharedProjectSpaceId);

    if (filesError) throw filesError;

    // Copy each file to the new project space
    for (const file of filesData) {
      const { error: fileCopyError } = await supabase
        .from('project_files')
        .insert([{
          name: file.name,
          code: file.code,
          project_space_id: newSpaceData.id
        }]);

      if (fileCopyError) throw fileCopyError;
    }

    toast.success('Espacio copiado exitosamente a tus proyectos');
    router.push('/proyects');
  } catch (err) {
    toast.error('Error al guardar en tus proyectos: ' + err.message);
  } finally {
    isSaving.value = false;
    isLoading.value = false;
  }
};

const loadSharedFile = async () => {
  try {
    const { data, error } = await supabase
      .from('shared_files')
      .select('*')
      .eq('id', sharedFileId.value)
      .single();

    if (error) throw error;

    if (data) {
      code.value = data.code;
      currentFileName.value = data.name;
    } else {
      toast.error('Archivo compartido no encontrado');
    }
  } catch (error) {
    toast.error('Error al cargar el archivo compartido: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

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

const showSaveToProjectModal = () => {
  if (saveToProjectModal) {
    saveToProjectModal.show();
  } else {
    console.error('saveToProjectModal is not initialized');
  }
};

const saveToProject = async () => {
  if (!selectedProjectSpace.value) {
    toast.error('Por favor selecciona un espacio de proyecto');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('project_files')
      .insert([
        {
          name: currentFileName.value || 'Nuevo Archivo',
          code: code.value,
          project_space_id: selectedProjectSpace.value,
        },
      ])
      .select();

    if (error) throw error;

    toast.success('Archivo guardado exitosamente en el proyecto');
    saveToProjectModal.hide();
    router.push(`/projects`);
  } catch (error) {
    toast.error('Error al guardar el archivo en el proyecto: ' + error.message);
  }
};

const currentProject = computed(() => {
  if (!route.query.projectId) return null;
  return projectSpaces.value.find(space => space.id === route.query.projectId);
});

const projectFiles = ref([]);

const loadProjectFiles = async () => {
  if (!currentProject.value) return;
  try {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_space_id', currentProject.value.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    projectFiles.value = data || [];
  } catch (error) {
    toast.error('Error al cargar los archivos del proyecto: ' + error.message);
  }
};

watch(currentProject, async () => {
  await loadProjectFiles();
});

onMounted(() => {
  loadProjectFiles();
});

function createFile() {
  // Usamos el valor directamente sin redefinir la variable
  try {
    // Establecer el estado de creación en proceso
    isCreatingFile.value = true;
    
    // Verificaciones básicas
    if (!newFileName.value || !newFileName.value.trim()) {
      toast.error("Por favor ingrese un nombre para el archivo");
      isCreatingFile.value = false; // Importante: resetear en caso de error
      return;
    }
    
    if (!currentProject.value || !currentProject.value.id) {
      toast.error("Por favor seleccione un proyecto primero");
      isCreatingFile.value = false; // Importante: resetear en caso de error
      return;
    }
    
    // Ejecutar la operación asíncrona usando .then/.catch en lugar de async/await
    // Esto puede evitar algunos problemas de contexto
    supabase
      .from('project_files')
      .insert([{
        name: newFileName.value.trim(),
        code: '// Tu código C# aquí\n',
        project_space_id: currentProject.value.id
      }])
      .select()
      .then(({ data, error }) => {
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error("No se recibieron datos después de crear el archivo");
        }
        
        // Actualizar la lista y el estado
        projectFiles.value = [data[0], ...projectFiles.value];
        
        // Cerrar modal si existe
        if (newFileModal) {
          newFileModal.hide();
        }
        
        // Limpiar formulario
        newFileName.value = '';
        toast.success('Archivo creado exitosamente');
        
        // Abrir el nuevo archivo
        openFile(data[0]);
        
      })
      .catch(err => {
        console.error("Error al crear archivo:", err);
        toast.error(`Error al crear el archivo: ${err.message || 'Error desconocido'}`);
      })
      .finally(() => {
        isCreatingFile.value = false;
      });
      
  } catch (e) {
    console.error("Error crítico:", e);
    toast.error("Error crítico al crear el archivo");
    isCreatingFile.value = false;
  }
}

const confirmDeleteFile = file => {
  itemToDelete.value = { type: 'file', item: file }
  if (deleteModal) {
    deleteModal.show()
  } else {
    console.error('deleteModal is not initialized')
  }
}

const confirmDeleteSpace = space => {
  itemToDelete.value = { type: 'space', item: space }
  if (deleteModal) {
    deleteModal.show()
  } else {
    console.error('deleteModal is not initialized')
  }
}

const deleteItem = async () => {
  if (!itemToDelete.value) return

  try {
    isDeleting.value = true

    if (itemToDelete.value.type === 'file') {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', itemToDelete.value.item.id)

      if (error) throw error

      projectFiles.value = projectFiles.value.filter(
        file => file.id !== itemToDelete.value.item.id
      )
    } else if (itemToDelete.value.type === 'space') {
      const { error } = await supabase
        .from('project_spaces')
        .delete()
        .eq('id', itemToDelete.value.item.id)

      if (error) throw error

      projectSpaces.value = projectSpaces.value.filter(
        space => space.id !== itemToDelete.value.item.id
      )
      router.push('/projects')
    }

    toast.success('Eliminado exitosamente')
    if (deleteModal) {
      deleteModal.hide()
    } else {
      console.error('deleteModal is not initialized')
    }
  } catch (error) {
    toast.error('Error al eliminar: ' + error.message)
  } finally {
    isDeleting.value = false
  }
}

const openFile = (file) => {
  // Obtener el projectId actual para mantenerlo
  const projectId = route.query.projectId || selectedProject.value;
  
  // Navegar manteniendo la referencia al proyecto
  router.push({
    path: '/',
    query: { 
      fileId: file.id,
      projectId: projectId // Mantener la referencia al proyecto
    }
  });
  
  // Actualizar inmediatamente las variables de estado
  fileId.value = file.id;
  code.value = file.code;
  currentFileName.value = file.name;
  
  // Importante: no cambiar selectedProject aquí para mantener el contexto
  if (projectId && !selectedProject.value) {
    selectedProject.value = projectId;
  }
};

const shareFile = async (file = null) => {
  try {
    // Si no se pasa un archivo, usar el archivo actual
    const fileToShare = file || { 
      id: fileId.value, 
      name: currentFileName.value,
      code: code.value
    }
    
    // Verificar que tengamos un archivo para compartir
    if (!fileToShare.name || !fileToShare.code) {
      toast.error('No hay archivo para compartir')
      return
    }
    
    // Generar un ID único para compartir
    const uniqueShareId = uuidv4()
    
    // Insertar en la tabla shared_files
    const { data, error } = await supabase
      .from('shared_files')
      .insert([{
        id: uniqueShareId,
        name: fileToShare.name,
        code: fileToShare.code
      }])
      .select()

    if (error) throw error

    // Generar URL para compartir
    const shareURL = `${window.location.origin}/?shared_file_id=${uniqueShareId}`
    
    // Copiar URL al portapapeles
    await navigator.clipboard.writeText(shareURL)
    
    toast.success('Link de archivo compartido copiado al portapapeles')
    
    // Generar código QR (opcional)
    try {
      qrCodeUrl.value = await QRCode.toDataURL(shareURL)
      if (shareModal) {
        shareModal.show()
      }
    } catch (qrError) {
      console.error('Error generando QR:', qrError)
    }
    
  } catch (error) {
    toast.error('Error al compartir el archivo: ' + error.message)
  }
}

const goToProjects = () => {
  router.push('/projects')
}

const selectedProject = ref(null)

const handleProjectChange = () => {
  if (selectedProject.value) {
    router.push({
      path: '/',
      query: { projectId: selectedProject.value }
    })
  }
}

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.fileId) {
      loadFile(newQuery.fileId);
    }
    
    if (newQuery.projectId) {
      selectedProject.value = newQuery.projectId;
      loadProjectFiles();
    }
  },
  { deep: true, immediate: true }
);

const showNewFileModal = () => {
  newFileName.value = ''
  if (newFileModal) {
    newFileModal.show()
  } else {
    console.error('newFileModal is not initialized')
  }
}

const copyCodeToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(code.value)
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 3000)
  } catch (error) {
    toast.error('Error al copiar el código: ' + error.message)
  }
}

</script>

<style scoped>
.output-container {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 4px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.4;
  font-size: 0.95rem;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.output-container.error {
  color: #f87171;
}

.input-prompt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.input-text {
  color: #4ade80;
}



pre {
  margin: 0;
}

/* Estilos adicionales */
.copy-button {
  opacity: 0.6;
  z-index: 10;
}

.copy-button:hover {
  opacity: 1;
}

.toast {
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.toast.show {
  opacity: 1;
}

/* Estilos para el modal de compartir */
.modal-content {
  border-radius: 8px;
}

.modal-header {
  background-color: var(--dark-blue);
  color: white;
  border-radius: 8px 8px 0 0;
}

.modal-body {
  padding: 1.5rem;
}

/* Estilo para hacer el editor más amplio */
.editor-body {
  height: auto;
  min-height: 550px;
}

.editor-card {
  height: 100%;
}

/* Para asegurar que el contenedor tenga suficiente altura */
.editor-container {
  min-height: 1300px;
}
</style>