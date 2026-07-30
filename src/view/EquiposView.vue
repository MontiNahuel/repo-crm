<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { groupService, type IGrupoTrabajo, type IMiembroEquipo } from '@/services/groups/groupService'
import { chatService, type IColaborador } from '@/services/chat/chatService'
import PanelContenedor from '@/components/ui/PanelContenedor.vue'
import ModalConfirmacion from '@/components/modals/ModalConfirmacion.vue'

// --- Autenticación ---
const authStore = useAuthStore()
const esAdmin = computed(() => authStore.userRole?.toLowerCase() === 'admin')
const miUsuarioId = computed(() => {
  if (!authStore.token) return null
  const parts = authStore.token.split('.')
  const payloadStr = parts[1]
  if (!payloadStr) return null
  try {
    return JSON.parse(atob(payloadStr)).sub
  } catch (e) {
    return null
  }
})

// --- Estado General ---
const grupos = ref<IGrupoTrabajo[]>([])
const miEquipo = ref<IGrupoTrabajo | null>(null)
const cargando = ref(false)
const cargandoMiEquipo = ref(false)
const errorMiEquipo = ref<string | null>(null)

// --- Modal de Creación (Admins) ---
const mostrarModalCrear = ref(false)
const nuevoNombre = ref('')
const nuevaDescripcion = ref('')
const guardandoGrupo = ref(false)

// --- Buscador de Colaboradores (Asignar miembros) ---
const busquedaFiltro = ref('')
const resultadosBusqueda = ref<IColaborador[]>([])
const cargandoBusqueda = ref(false)
const grupoSeleccionadoParaBusqueda = ref<number | null>(null)
let debounceTimeout: any = null

// Carga general de grupos para Admins
const cargarTodosLosGrupos = async () => {
  cargando.value = true
  try {
    grupos.value = await groupService.getGrupos()
  } catch (err) {
    console.error('Error al cargar grupos:', err)
  } finally {
    cargando.value = false
  }
}

// Carga del equipo específico para no-admins
const cargarMiEquipo = async () => {
  cargandoMiEquipo.value = true
  errorMiEquipo.value = null
  try {
    miEquipo.value = await groupService.getMiEquipo()
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      errorMiEquipo.value = "No perteneces a ningún grupo de trabajo actualmente"
    } else {
      errorMiEquipo.value = "Ocurrió un error al cargar la información del equipo"
    }
    console.error('Error al cargar mi equipo:', err)
  } finally {
    cargandoMiEquipo.value = false
  }
}

// Inicialización de la vista
onMounted(() => {
  if (esAdmin.value) {
    cargarTodosLosGrupos()
  } else {
    cargarMiEquipo()
  }
})

// Crear Grupo (Admin)
const crearGrupo = async () => {
  if (!nuevoNombre.value.trim()) return
  guardandoGrupo.value = true
  try {
    await groupService.crearGrupo(nuevoNombre.value, nuevaDescripcion.value)
    nuevoNombre.value = ''
    nuevaDescripcion.value = ''
    mostrarModalCrear.value = false
    await cargarTodosLosGrupos()
  } catch (err) {
    console.error('Error al crear grupo:', err)
  } finally {
    guardandoGrupo.value = false
  }
}

// --- Modal de Confirmación Generico ---
const mostrarConfirmacion = ref(false)
const tituloConfirmacion = ref('')
const mensajeConfirmacion = ref('')
const textoConfirmacionBtn = ref('Eliminar')
const cargandoConfirmacion = ref(false)
const accionConfirmacion = ref<(() => Promise<void>) | null>(null)

const abrirConfirmacion = (titulo: string, mensaje: string, textoBtn: string, accion: () => Promise<void>) => {
  tituloConfirmacion.value = titulo
  mensajeConfirmacion.value = mensaje
  textoConfirmacionBtn.value = textoBtn
  accionConfirmacion.value = accion
  mostrarConfirmacion.value = true
}

const ejecutarConfirmacion = async () => {
  if (!accionConfirmacion.value) return
  cargandoConfirmacion.value = true
  try {
    await accionConfirmacion.value()
    mostrarConfirmacion.value = false
  } catch (err) {
    console.error('Error al ejecutar confirmación:', err)
  } finally {
    cargandoConfirmacion.value = false
    accionConfirmacion.value = null
  }
}

// Eliminar Grupo (Admin)
const eliminarGrupo = (grupoId: number) => {
  abrirConfirmacion(
    '¿Eliminar grupo de trabajo?',
    '¿Estás seguro de que deseas eliminar este grupo? Sus miembros quedarán libres y su chat grupal se borrará permanentemente de MongoDB.',
    'Eliminar',
    async () => {
      await groupService.eliminarGrupo(grupoId)
      await cargarTodosLosGrupos()
    }
  )
}

// --- Autocomplete de Asignación ---
const iniciarBusqueda = (grupoId: number) => {
  grupoSeleccionadoParaBusqueda.value = grupoId
  busquedaFiltro.value = ''
  resultadosBusqueda.value = []
}

watch(busquedaFiltro, (val) => {
  clearTimeout(debounceTimeout)
  if (!val.trim() || val.length < 2) {
    resultadosBusqueda.value = []
    return
  }
  cargandoBusqueda.value = true
  debounceTimeout = setTimeout(async () => {
    try {
      resultadosBusqueda.value = await chatService.buscarColaboradores(val)
    } catch (err) {
      console.error(err)
    } finally {
      cargandoBusqueda.value = false
    }
  }, 300)
})

const asignarColaborador = async (grupoId: number, colabId: number) => {
  try {
    await groupService.asignarMiembro(grupoId, colabId)
    busquedaFiltro.value = ''
    resultadosBusqueda.value = []
    grupoSeleccionadoParaBusqueda.value = null
    
    // Recargamos el estado
    if (esAdmin.value) {
      await cargarTodosLosGrupos()
    } else {
      await cargarMiEquipo()
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Error al asignar colaborador')
  }
}

const removerColaborador = (grupoId: number, usuarioId: number, nombre: string) => {
  abrirConfirmacion(
    '¿Remover colaborador?',
    `¿Estás seguro de que deseas remover a ${nombre} de este grupo de trabajo?`,
    'Remover',
    async () => {
      await groupService.removerMiembro(grupoId, usuarioId)
      if (esAdmin.value) {
        await cargarTodosLosGrupos()
      } else {
        await cargarMiEquipo()
      }
    }
  )
}

// Resuelve si el usuario actual es Supervisor de un grupo
const esSupervisorDeEsteGrupo = (grupo: IGrupoTrabajo) => {
  if (esAdmin.value) return true
  const miembroActivo = grupo.miembros.find(m => m.id.toString() === miUsuarioId.value?.toString())
  return miembroActivo?.rol?.toUpperCase() === 'SUPERVISOR'
}
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Encabezado General -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
          <span>👥</span> Celulas y Equipos de Trabajo
        </h1>
        <p class="text-sm text-text-muted">
          {{ esAdmin ? 'Administra y asigna colaboradores a las células comerciales de la empresa.' : 'Mira a tus compañeros de equipo y supervisor comercial.' }}
        </p>
      </div>

      <button 
        v-if="esAdmin" 
        @click="mostrarModalCrear = true" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/10 flex items-center gap-2 hover:scale-[1.02]"
      >
        <span>➕</span> Crear Nuevo Equipo
      </button>
    </div>

    <!-- VISTA ADMINISTRADORES -->
    <template v-if="esAdmin">
      <div v-if="cargando" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="grupos.length === 0" class="flex flex-col items-center justify-center py-20 text-center bg-sidebar/50 border border-border-main rounded-2xl p-8 backdrop-blur-md">
        <span class="text-4xl mb-4">📢</span>
        <h3 class="text-lg font-bold text-text-main">No hay equipos creados</h3>
        <p class="text-sm text-text-muted max-w-sm mt-1">Crea la primera célula de trabajo para agrupar y organizar a tus vendedores.</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="grupo in grupos" 
          :key="grupo.id" 
          class="bg-sidebar border border-border-main rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
        >
          <!-- Encabezado de la Tarjeta de Grupo -->
          <div class="p-6 border-b border-border-main bg-bg-main/20 flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="font-bold text-lg text-text-main flex items-center gap-2">
                <span>📂</span> {{ grupo.nombre }}
              </h3>
              <p class="text-xs text-text-muted line-clamp-2">{{ grupo.descripcion || 'Sin descripción disponible.' }}</p>
            </div>
            
            <button 
              @click="eliminarGrupo(grupo.id)" 
              class="text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2.5 py-1.5 rounded-lg transition"
            >
              Eliminar
            </button>
          </div>

          <!-- Integrantes / Miembros -->
          <div class="p-6 flex-1 flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <span class="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                Miembros ({{ grupo.miembros.length }})
              </span>
            </div>

            <!-- Listado de Colaboradores Asignados -->
            <div class="space-y-2 flex-1 max-h-[220px] overflow-y-auto pr-1">
              <div v-if="grupo.miembros.length === 0" class="text-center py-6 text-xs text-text-muted border border-dashed border-border-main/50 rounded-xl bg-bg-main/10">
                Célula vacía. Agrega miembros para comenzar.
              </div>
              <div 
                v-else
                v-for="miembro in grupo.miembros" 
                :key="miembro.id" 
                class="flex items-center justify-between p-3 rounded-xl bg-bg-main/30 border border-border-main hover:border-slate-300 dark:hover:border-white/10 transition group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold font-mono">
                    {{ miembro.nombre.charAt(0) }}{{ miembro.apellido?.charAt(0) }}
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-text-main flex items-center gap-1.5">
                      {{ miembro.nombre }} {{ miembro.apellido }}
                      <span 
                        :class="[
                          miembro.rol === 'SUPERVISOR' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-text-muted border-border-main/20'
                        ]"
                        class="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-extrabold font-mono"
                      >
                        {{ miembro.rol }}
                      </span>
                    </h5>
                    <p class="text-[10px] text-text-muted leading-none mt-0.5">{{ miembro.email }}</p>
                  </div>
                </div>

                <button 
                  @click="removerColaborador(grupo.id, miembro.id, miembro.nombre)" 
                  class="text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-1 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  Remover
                </button>
              </div>
            </div>

            <!-- Caja de Asignación / Autocomplete -->
            <div class="relative pt-4 border-t border-border-main/50">
              <div v-if="grupoSeleccionadoParaBusqueda !== grupo.id">
                <button 
                  @click="iniciarBusqueda(grupo.id)" 
                  class="w-full py-2.5 rounded-xl border border-dashed border-blue-500/30 hover:border-blue-500 text-xs font-bold text-blue-500 hover:bg-blue-500/5 transition flex items-center justify-center gap-1.5"
                >
                  <span>👤➕</span> Asignar nuevo colaborador
                </button>
              </div>
              <div v-else class="space-y-2">
                <div class="flex items-center gap-2">
                  <input 
                    v-model="busquedaFiltro" 
                    type="text" 
                    placeholder="Escribe nombre o email del vendedor..." 
                    class="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-blue-500 transition"
                    autoFocus
                  />
                  <button 
                    @click="grupoSeleccionadoParaBusqueda = null" 
                    class="text-xs text-text-muted px-2 py-2 hover:text-text-main transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>

                <!-- Lista de Resultados de Búsqueda -->
                <div 
                  v-if="resultadosBusqueda.length > 0" 
                  class="absolute bottom-full left-0 right-0 mb-2 max-h-[160px] overflow-y-auto bg-sidebar border border-border-main rounded-xl shadow-xl z-50 p-2 space-y-1 backdrop-blur-lg"
                >
                  <button 
                    v-for="colab in resultadosBusqueda" 
                    :key="colab.id"
                    @click="asignarColaborador(grupo.id, colab.id)"
                    class="w-full text-left p-2 hover:bg-bg-hover rounded-lg transition text-xs flex items-center justify-between"
                  >
                    <div class="flex flex-col">
                      <span class="font-bold text-text-main">{{ colab.nombre }} {{ colab.apellido }}</span>
                      <span class="text-[10px] text-text-muted">{{ colab.email }}</span>
                    </div>
                    <span class="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 font-mono">{{ colab.rol }}</span>
                  </button>
                </div>
                <div v-else-if="busquedaFiltro.length >= 2 && cargandoBusqueda" class="absolute bottom-full left-0 right-0 mb-2 p-3 text-center text-xs text-text-muted bg-sidebar border border-border-main rounded-xl shadow-lg z-50">
                  Buscando colaboradores...
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>

    <!-- VISTA VENDEDORES / SUPERVISORES (MI EQUIPO) -->
    <template v-else>
      <div v-if="cargandoMiEquipo" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="errorMiEquipo" class="flex flex-col items-center justify-center py-20 text-center bg-sidebar/30 border border-border-main rounded-2xl p-8 backdrop-blur-md">
        <div class="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mb-4 font-mono font-bold">
          👥
        </div>
        <h3 class="text-lg font-bold text-text-main">{{ errorMiEquipo }}</h3>
        <p class="text-sm text-text-muted max-w-sm mt-1">Actualmente no perteneces a ningún equipo comercial. Pídele a tu Administrador que te asigne a una célula de trabajo.</p>
      </div>

      <div v-else-if="miEquipo" class="space-y-6">
        <!-- Tarjeta de Ficha de Equipo -->
        <div class="bg-sidebar border border-border-main rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="space-y-1">
            <span class="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              Mi célula comercial
            </span>
            <h2 class="text-2xl font-bold text-text-main flex items-center gap-2 mt-1">
              <span>🚀</span> {{ miEquipo.nombre }}
            </h2>
            <p class="text-sm text-text-muted max-w-2xl">{{ miEquipo.descripcion || 'Sin descripción disponible.' }}</p>
          </div>
          
          <div class="flex items-center gap-2 text-xs font-bold text-text-muted bg-bg-main/30 border border-border-main px-4 py-2.5 rounded-xl">
            <span>📅 Creado el:</span> {{ new Date(miEquipo.creado_en || '').toLocaleDateString() }}
          </div>
        </div>

        <!-- Miembros del Equipo -->
        <div class="space-y-4">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-text-muted pl-1">
            Compañeros de Equipo ({{ miEquipo.miembros.length }})
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="miembro in miEquipo.miembros" 
              :key="miembro.id" 
              class="bg-sidebar border border-border-main rounded-2xl p-5 shadow-sm flex items-center justify-between group transition hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm font-bold font-mono">
                  {{ miembro.nombre.charAt(0) }}{{ miembro.apellido?.charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-sm text-text-main flex items-center gap-2">
                    {{ miembro.nombre }} {{ miembro.apellido }}
                    <span 
                      v-if="miembro.id.toString() === miUsuarioId?.toString()" 
                      class="bg-blue-600/10 text-blue-500 border-blue-500/20 text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-extrabold"
                    >
                      Tú
                    </span>
                  </h4>
                  <p class="text-xs text-text-muted mt-0.5">{{ miembro.email }}</p>
                  
                  <span 
                    :class="[
                      miembro.rol === 'SUPERVISOR' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-text-muted border-border-main/20'
                    ]"
                    class="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-extrabold font-mono inline-block mt-2"
                  >
                    {{ miembro.rol }}
                  </span>
                </div>
              </div>

              <!-- El supervisor del grupo puede remover miembros -->
              <button 
                v-if="esSupervisorDeEsteGrupo(miEquipo) && miembro.id.toString() !== miUsuarioId?.toString()"
                @click="removerColaborador(miEquipo.id, miembro.id, miembro.nombre)"
                class="text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-1 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                Remover
              </button>
            </div>

            <!-- El Supervisor también puede agregar miembros a su propio equipo desde aquí -->
            <div 
              v-if="esSupervisorDeEsteGrupo(miEquipo)" 
              class="bg-sidebar border border-dashed border-blue-500/30 rounded-2xl p-5 flex flex-col justify-center gap-3 min-h-[110px]"
            >
              <div v-if="grupoSeleccionadoParaBusqueda !== miEquipo.id">
                <button 
                  @click="iniciarBusqueda(miEquipo.id)" 
                  class="w-full py-4 text-xs font-extrabold text-blue-500 hover:bg-blue-500/5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>👤➕</span> Agregar compañero de ventas
                </button>
              </div>
              <div v-else class="relative space-y-2">
                <div class="flex items-center gap-2">
                  <input 
                    v-model="busquedaFiltro" 
                    type="text" 
                    placeholder="Buscar vendedor..." 
                    class="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-blue-500 transition"
                    autoFocus
                  />
                  <button 
                    @click="grupoSeleccionadoParaBusqueda = null" 
                    class="text-xs text-text-muted px-2 py-1 hover:text-text-main transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>

                <div 
                  v-if="resultadosBusqueda.length > 0" 
                  class="absolute bottom-full left-0 right-0 mb-2 max-h-[160px] overflow-y-auto bg-sidebar border border-border-main rounded-xl shadow-xl z-50 p-2 space-y-1"
                >
                  <button 
                    v-for="colab in resultadosBusqueda" 
                    :key="colab.id"
                    @click="asignarColaborador(miEquipo.id, colab.id)"
                    class="w-full text-left p-2 hover:bg-bg-hover rounded-lg transition text-xs flex items-center justify-between"
                  >
                    <div class="flex flex-col">
                      <span class="font-bold text-text-main">{{ colab.nombre }} {{ colab.apellido }}</span>
                      <span class="text-[10px] text-text-muted">{{ colab.email }}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>

    <!-- DIALOG MODAL: CREAR GRUPO DE TRABAJO (SOLO ADMINS) -->
    <Teleport to="body">
      <div 
        v-if="mostrarModalCrear" 
        class="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-md flex justify-center items-center z-50 p-4"
        @click.self="mostrarModalCrear = false"
      >
        <div class="bg-sidebar border border-border-main rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
          <div class="p-6 border-b border-border-main flex justify-between items-center">
            <h3 class="font-bold text-lg text-text-main">Crear Célula de Trabajo</h3>
            <button @click="mostrarModalCrear = false" class="text-text-muted hover:text-text-main transition text-lg">✕</button>
          </div>

          <form @submit.prevent="crearGrupo" class="p-6 space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre del Equipo</label>
              <input 
                v-model="nuevoNombre" 
                type="text" 
                required 
                placeholder="Ej: Ventas Latam, Célula Norte, etc." 
                class="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-muted uppercase tracking-wider">Descripción o Meta</label>
              <textarea 
                v-model="nuevaDescripcion" 
                rows="3"
                placeholder="Ej: Encargados del pipeline regional y prospección fría." 
                class="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-blue-500 transition resize-none"
              ></textarea>
            </div>

            <div class="pt-4 border-t border-border-main flex justify-end gap-3">
              <button 
                type="button" 
                @click="mostrarModalCrear = false" 
                class="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-main transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                :disabled="guardandoGrupo"
                class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {{ guardandoGrupo ? 'Creando...' : 'Crear Equipo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Confirmación -->
    <Teleport to="body">
      <ModalConfirmacion 
        v-if="mostrarConfirmacion"
        :titulo="tituloConfirmacion"
        :mensaje="mensajeConfirmacion"
        :textoConfirmar="textoConfirmacionBtn"
        :cargando="cargandoConfirmacion"
        @confirmar="ejecutarConfirmacion"
        @cancelar="mostrarConfirmacion = false"
      />
    </Teleport>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
