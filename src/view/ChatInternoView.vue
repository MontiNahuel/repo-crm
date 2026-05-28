<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useSocket } from '@/composables/useSocket'
import { chatService, type IConversacion, type IMensaje, type IColaborador } from '@/services/chat/chatService'
import { jwtDecode } from 'jwt-decode'

// --- Autenticación ---
const authStore = useAuthStore()
const miUsuarioId = computed(() => {
    if (!authStore.token) return null
    try {
        const decoded = jwtDecode<{ sub: string }>(authStore.token)
        return parseInt(decoded.sub)
    } catch {
        return null
    }
})

// --- Estado General ---
const conversaciones = ref<IConversacion[]>([])
const conversacionSeleccionada = ref<IConversacion | null>(null)
const mensajes = ref<IMensaje[]>([])
const nuevoMensajeText = ref('')
const cargandoConversaciones = ref(false)
const cargandoHistorial = ref(false)
const cargandoMasMensajes = ref(false)
const contenedorMensajes = ref<HTMLElement | null>(null)

// --- Paginación Bucket Pattern ---
const paginaActual = ref(1)
const tieneMasMensajes = ref(false)

// --- Buscador estilo Teams ---
const busquedaColaborador = ref('')
const resultadosBusqueda = ref<IColaborador[]>([])
const cargandoBusqueda = ref(false)
let debounceTimeout: any = null

// --- Crear Grupo ---
const mostrarModalGrupo = ref(false)
const nombreGrupo = ref('')
const participantesGrupo = ref<number[]>([])
const cargandoCreacionGrupo = ref(false)

// --- Socket.IO ---
const { socket, connect, disconnect, isConnected } = useSocket()
const isConnectedReal = computed(() => isConnected.value || socket.connected)

// Filtramos conversaciones vacías (directas sin mensajes que no estén seleccionadas)
const conversacionesFiltradas = computed(() => {
    return conversaciones.value.filter(conv => {
        if (conv.is_group || conv.type === 'group') return true
        if (conv.last_message !== null) return true
        if (conversacionSeleccionada.value && conv.id === conversacionSeleccionada.value.id) return true
        return false
    })
})

// Formatea la hora para los globos de chat
const formatearHora = (isoString: string) => {
    try {
        const fecha = new Date(isoString)
        return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return ''
    }
}

// Carga el listado lateral de conversaciones activas
const cargarConversaciones = async () => {
    cargandoConversaciones.value = true
    try {
        conversaciones.value = await chatService.getConversaciones()
        
        // Nos unimos a la sala de Socket.IO de cada conversación activa para recibir notificaciones en tiempo real
        conversaciones.value.forEach(conv => {
            socket.emit('join_conversation', { conversation_id: conv.id })
        })
    } catch (error) {
        console.error('Error al cargar conversaciones:', error)
    } finally {
        cargandoConversaciones.value = false
    }
}

// Resuelve de manera reactiva el nombre a mostrar en el chat
const resolverNombreConversacion = (conv: IConversacion) => {
    if (conv.is_group || conv.type === 'group') return conv.name || 'Chat Grupal'
    const companero = conv.participants.find(p => p.user_id !== miUsuarioId.value)
    return companero ? `${companero.nombre} ${companero.apellido || ''}`.trim() : 'Colaborador'
}

// Resuelve la inicial o avatar para el chat
const resolverAvatarConversacion = (conv: IConversacion) => {
    if (conv.is_group || conv.type === 'group') return '👥'
    const companero = conv.participants.find(p => p.user_id !== miUsuarioId.value)
    return companero ? companero.nombre.charAt(0).toUpperCase() : '👤'
}

// Resuelve el rol para el encabezado del chat activo
const resolverRolSubtitulo = (conv: IConversacion) => {
    if (conv.is_group || conv.type === 'group') {
        return `${conv.participants.length} participantes`
    }
    const companero = conv.participants.find(p => p.user_id !== miUsuarioId.value)
    return companero ? companero.rol : ''
}

// Carga la primera página del historial del chat seleccionado
const cargarHistorialConversacion = async (conv: IConversacion) => {
    cargandoHistorial.value = true
    paginaActual.value = 1
    tieneMasMensajes.value = false
    try {
        const hist = await chatService.getHistorial(conv.id, 1)
        mensajes.value = hist // Los buckets de MongoDB ya guardan los mensajes de forma cronológica ascendente
        
        // Si hay exactamente 50 mensajes, el bucket está lleno y hay más páginas
        tieneMasMensajes.value = hist.length === 50
        
        await nextTick()
        hacerScrollAlFinal()
    } catch (error) {
        console.error('Error al cargar historial:', error)
    } finally {
        cargandoHistorial.value = false
    }
}

// Carga mensajes históricos anteriores (Bucket Pattern - page=2, 3...)
const cargarMensajesAnteriores = async () => {
    if (!conversacionSeleccionada.value || cargandoMasMensajes.value) return
    cargandoMasMensajes.value = true
    const proxPagina = paginaActual.value + 1
    
    try {
        const histAnterior = await chatService.getHistorial(conversacionSeleccionada.value.id, proxPagina)
        if (histAnterior.length > 0) {
            // Guardamos la altura del contenedor antes de añadir mensajes
            const alturaPrevia = contenedorMensajes.value?.scrollHeight || 0
            
            // Añadimos al inicio
            mensajes.value = [...histAnterior, ...mensajes.value]
            paginaActual.value = proxPagina
            tieneMasMensajes.value = histAnterior.length === 50
            
            await nextTick()
            // Ajustamos el scroll para mantener la lectura intacta
            if (contenedorMensajes.value) {
                const nuevaAltura = contenedorMensajes.value.scrollHeight
                contenedorMensajes.value.scrollTop = nuevaAltura - alturaPrevia
            }
        } else {
            tieneMasMensajes.value = false
        }
    } catch (error) {
        console.error('Error al cargar páginas históricas:', error)
    } finally {
        cargandoMasMensajes.value = false
    }
}

// Hace scroll al final del chat
const hacerScrollAlFinal = () => {
    if (contenedorMensajes.value) {
        contenedorMensajes.value.scrollTop = contenedorMensajes.value.scrollHeight
    }
}

// Selección de un chat de la barra lateral
const seleccionarConversacion = async (conv: IConversacion) => {
    if (conversacionSeleccionada.value?.id === conv.id) return

    conversacionSeleccionada.value = conv
    
    // 2. Cargamos historial REST
    await cargarHistorialConversacion(conv)
    
    // 3. Nos unimos a la sala de Socket.IO
    socket.emit('join_conversation', { conversation_id: conv.id })
    
    // 4. Marcamos la conversación como leída
    socket.emit('read_conversation', { conversation_id: conv.id })
}

// Enviar un nuevo mensaje vía Socket.IO
const enviarMensaje = () => {
    if (!nuevoMensajeText.value.trim() || !conversacionSeleccionada.value) return

    const payload = {
        conversation_id: conversacionSeleccionada.value.id,
        content: nuevoMensajeText.value,
        type: 'text'
    }

    // Enviamos el mensaje al servidor vía Socket
    socket.emit('send_message', payload)
    nuevoMensajeText.value = ''
}

// Buscador estilo Teams con Debounce de 300ms
watch(busquedaColaborador, (nuevaBusqueda) => {
    clearTimeout(debounceTimeout)
    if (!nuevaBusqueda.trim() || nuevaBusqueda.length < 2) {
        resultadosBusqueda.value = []
        return
    }

    cargandoBusqueda.value = true
    debounceTimeout = setTimeout(async () => {
        try {
            resultadosBusqueda.value = await chatService.buscarColaboradores(nuevaBusqueda)
        } catch (error) {
            console.error('Error al buscar colaboradores:', error)
        } finally {
            cargandoBusqueda.value = false
        }
    }, 300)
})

// Abre o crea un chat directo con un colaborador del buscador
const iniciarChatConColaborador = async (colab: IColaborador) => {
    try {
        cargandoConversaciones.value = true
        // 1. Llamamos a la API directa (Si existe retorna la actual, sino crea una nueva)
        const nuevaConv = await chatService.obtenerOCrearChatDirecto(colab.id)
        
        // 2. Buscamos si ya está en la barra lateral, sino la agregamos
        const existe = conversaciones.value.find(c => c.id === nuevaConv.id)
        if (!existe) {
            conversaciones.value.unshift(nuevaConv)
            // Nos unimos a la sala del socket para alertas en segundo plano
            socket.emit('join_conversation', { conversation_id: nuevaConv.id })
        }
        
        // 3. Limpiamos buscador
        busquedaColaborador.value = ''
        resultadosBusqueda.value = []
        
        // 4. Seleccionamos el chat
        await seleccionarConversacion(nuevaConv)
    } catch (error) {
        console.error('Error al iniciar chat directo:', error)
    } finally {
        cargandoConversaciones.value = false
    }
}

// Crea una nueva conversación grupal
const ejecutarCreacionGrupo = async () => {
    if (!nombreGrupo.value.trim() || participantesGrupo.value.length === 0) return
    cargandoCreacionGrupo.value = true
    try {
        const nuevoGrupo = await chatService.crearGrupo(nombreGrupo.value, participantesGrupo.value)
        conversaciones.value.unshift(nuevoGrupo)
        // Nos unimos a la sala del socket del grupo creado
        socket.emit('join_conversation', { conversation_id: nuevoGrupo.id })
        
        mostrarModalGrupo.value = false
        nombreGrupo.value = ''
        participantesGrupo.value = []
        await seleccionarConversacion(nuevoGrupo)
    } catch (error) {
        console.error('Error al crear grupo:', error)
    } finally {
        cargandoCreacionGrupo.value = false
    }
}

// --- Listeners de Eventos en Tiempo Real (Socket.IO) ---
const registrarListenersSocket = () => {
    // Escucha la llegada de nuevos mensajes
    socket.on('new_message', (msg: IMensaje) => {
        // 1. Si pertenece a la conversación abierta actualmente
        if (conversacionSeleccionada.value && msg.conversation_id === conversacionSeleccionada.value.id) {
            mensajes.value.push(msg)
            nextTick(() => {
                hacerScrollAlFinal()
            })
            // Confirmamos lectura de inmediato al servidor
            socket.emit('read_conversation', { conversation_id: conversacionSeleccionada.value.id })
        }
        
        // 2. Actualizamos la previsualización del mensaje en la lista lateral
        const convIndex = conversaciones.value.findIndex(c => c.id === msg.conversation_id)
        if (convIndex !== -1) {
            const conv = conversaciones.value[convIndex]
            if (conv) {
                conv.last_message = {
                    sender_id: msg.sender_id,
                    sender_name: msg.sender_name,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    type: msg.type
                }
                
                // Si no estamos viendo ese chat, agregamos una marca de lectura pendiente en el objeto last_read con fecha del pasado
                if (miUsuarioId.value) {
                    if (!conversacionSeleccionada.value || conversacionSeleccionada.value.id !== msg.conversation_id) {
                        conv.last_read[miUsuarioId.value.toString()] = '1970-01-01T00:00:00.000Z'
                    } else {
                        conv.last_read[miUsuarioId.value.toString()] = new Date().toISOString()
                    }
                }
            }
            
            // Movemos la conversación al inicio de la lista lateral
            const removed = conversaciones.value.splice(convIndex, 1)
            if (removed.length > 0 && removed[0]) {
                conversaciones.value.unshift(removed[0])
            }
        } else {
            // Si es un chat totalmente nuevo que no figuraba en la barra, refrescamos el listado completo
            cargarConversaciones()
        }
    })

    // Escucha cuando otro usuario marca como leído el chat
    socket.on('conversation_read', (payload: { conversation_id: string; user_id: number; read_at: string }) => {
        if (conversacionSeleccionada.value && payload.conversation_id === conversacionSeleccionada.value.id) {
            // Actualizamos la marca en nuestra conversación seleccionada
            conversacionSeleccionada.value.last_read[payload.user_id.toString()] = payload.read_at
        }
        
        const convIndex = conversaciones.value.findIndex(c => c.id === payload.conversation_id)
        if (convIndex !== -1) {
            const conv = conversaciones.value[convIndex]
            if (conv) {
                conv.last_read[payload.user_id.toString()] = payload.read_at
            }
        }
    })
}

// Quita los listeners al desmontar el componente
const removerListenersSocket = () => {
    socket.off('new_message')
    socket.off('conversation_read')
}

// Resuelve si el mensaje fue leído por la otra persona (simplificado para 1-a-1)
const esMensajeLeido = (msg: IMensaje) => {
    if (!conversacionSeleccionada.value || msg.sender_id !== miUsuarioId.value) return false
    
    // Obtenemos los IDs de los otros participantes
    const otros = conversacionSeleccionada.value.participants.filter(p => p.user_id !== miUsuarioId.value)
    if (otros.length === 0) return false
    
    // Si todos los demás participantes leyeron en una fecha posterior al timestamp del mensaje
    return otros.every(o => {
        const lastReadTime = conversacionSeleccionada.value!.last_read[o.user_id.toString()]
        if (!lastReadTime) return false
        return new Date(lastReadTime) >= new Date(msg.timestamp)
    })
}

// Resuelve si una conversación de la barra lateral tiene mensajes no leídos
const tieneMensajesNoLeidos = (conv: IConversacion) => {
    if (!miUsuarioId.value || !conv.last_message) return false
    
    // Si el último mensaje es nuestro, no está sin leer por nosotros
    if (conv.last_message.sender_id === miUsuarioId.value) return false
    
    const miUltimaLectura = conv.last_read[miUsuarioId.value.toString()]
    if (!miUltimaLectura) return true // Nunca leído = No leído
    
    return new Date(conv.last_message.timestamp) > new Date(miUltimaLectura)
}

onMounted(async () => {
    // 1. Establecemos la conexión de Socket autenticada
    connect()
    
    // 2. Cargamos las conversaciones por REST
    await cargarConversaciones()
    
    // 3. Registramos los listeners del tiempo real
    registrarListenersSocket()
})

onUnmounted(() => {
    // Limpiamos los canales del socket al salir de la pantalla
    if (conversacionSeleccionada.value) {
        socket.emit('leave_conversation', { conversation_id: conversacionSeleccionada.value.id })
    }
    removerListenersSocket()
})
</script>

<template>
    <div class="h-[calc(100vh-64px)] w-full flex bg-bg-main border-t border-border-main overflow-hidden animate-fade-in">
        
        <!-- Barra Lateral Izquierda (Listado de Chats & Buscador) -->
        <div class="w-80 border-r border-border-main flex flex-col bg-sidebar transition-colors shrink-0 z-10">
            
            <!-- Encabezado de la barra lateral con buscador escalable estilo Teams -->
            <div class="p-4 border-b border-border-main bg-bg-main/30 space-y-3 relative">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm font-bold text-text-main transition-colors">Chat Interno</h3>
                    
                    <button 
                        @click="mostrarModalGrupo = true" 
                        class="p-1.5 bg-bg-main hover:bg-bg-hover text-blue-500 border border-border-main rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Crear grupo nuevo"
                    >
                        <span>➕ Grupo</span>
                    </button>
                </div>

                <div class="relative">
                    <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input 
                        type="text" 
                        v-model="busquedaColaborador" 
                        placeholder="Buscar compañero..." 
                        class="w-full pl-9 pr-8 py-2 bg-bg-main border border-border-main rounded-xl text-xs text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                    <button 
                        v-if="busquedaColaborador"
                        @click="busquedaColaborador = ''"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs"
                    >
                        ✖
                    </button>
                </div>

                <!-- Desplegable flotante de resultados del Buscador Teams -->
                <div 
                    v-if="resultadosBusqueda.length > 0 || cargandoBusqueda" 
                    class="absolute top-[95px] left-4 right-4 bg-sidebar border border-border-main shadow-2xl rounded-2xl p-2 max-h-60 overflow-y-auto z-50 animate-fade-in"
                >
                    <div v-if="cargandoBusqueda" class="flex items-center justify-center py-4 gap-2 text-xs text-text-muted">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Buscando colaboradores...
                    </div>
                    <div v-else>
                        <div 
                            v-for="colab in resultadosBusqueda" 
                            :key="colab.id"
                            @click="iniciarChatConColaborador(colab)"
                            class="p-2.5 flex items-center gap-3 hover:bg-bg-hover rounded-xl cursor-pointer transition-colors"
                        >
                            <div class="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-xs font-extrabold uppercase shrink-0">
                                {{ colab.nombre.charAt(0) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-text-main truncate">{{ colab.nombre }} {{ colab.apellido }}</p>
                                <p class="text-[10px] text-text-muted truncate uppercase tracking-wider font-semibold">{{ colab.rol }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Listado de Conversaciones -->
            <div class="flex-1 overflow-y-auto">
                <div v-if="cargandoConversaciones && conversacionesFiltradas.length === 0" class="flex flex-col items-center justify-center py-10 gap-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="text-xs text-text-muted">Cargando salas...</span>
                </div>

                <div v-else-if="conversacionesFiltradas.length === 0" class="flex flex-col items-center justify-center py-16 text-center text-text-muted select-none p-4">
                    <span class="text-3xl mb-2">💬</span>
                    <p class="text-xs font-medium">No tenés conversaciones activas</p>
                    <p class="text-[10px] text-text-muted mt-1">Buscá un compañero arriba para iniciar un chat directo.</p>
                </div>

                <div 
                    v-else 
                    v-for="conv in conversacionesFiltradas" 
                    :key="conv.id" 
                    @click="seleccionarConversacion(conv)"
                    :class="['p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-border-main/20 relative group', 
                             conversacionSeleccionada?.id === conv.id ? 'bg-bg-hover border-l-4 border-l-blue-500' : 'hover:bg-bg-hover/50 border-l-4 border-l-transparent']"
                >
                    <!-- Icono o inicial -->
                    <div class="relative w-10 h-10 rounded-full bg-bg-main border border-border-main flex items-center justify-center text-sm font-extrabold shrink-0 shadow-sm transition-colors group-hover:border-blue-500/30">
                        {{ resolverAvatarConversacion(conv) }}
                    </div>

                    <!-- Detalles del Chat -->
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-0.5">
                            <p :class="['text-xs truncate transition-colors', tieneMensajesNoLeidos(conv) ? 'font-black text-text-main' : 'font-bold text-text-main/90']">
                                {{ resolverNombreConversacion(conv) }}
                            </p>
                            <span v-if="conv.last_message" class="text-[9px] text-text-muted shrink-0 ml-1">
                                {{ formatearHora(conv.last_message.timestamp) }}
                            </span>
                        </div>
                        <p :class="['text-[11px] truncate transition-colors', tieneMensajesNoLeidos(conv) ? 'text-blue-500 font-bold' : 'text-text-muted']">
                            <span v-if="conv.last_message?.sender_id === miUsuarioId" class="text-[10px] font-semibold text-text-muted">Tú: </span>
                            {{ conv.last_message ? conv.last_message.content : 'Sin mensajes aún' }}
                        </p>
                    </div>

                    <!-- Indicador visual de no leído -->
                    <span 
                        v-if="tieneMensajesNoLeidos(conv)" 
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"
                    ></span>
                </div>
            </div>
        </div>

        <!-- Panel de Chat Principal (Derecho) -->
        <div class="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-bg-main relative">
            
            <!-- Chat Abierto Activo -->
            <template v-if="conversacionSeleccionada">
                
                <!-- Encabezado del Chat Activo -->
                <div class="h-16 px-6 border-b border-border-main bg-sidebar flex items-center justify-between shrink-0 shadow-sm z-10 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-bg-main border border-border-main flex items-center justify-center text-sm font-extrabold shrink-0 shadow-sm">
                            {{ resolverAvatarConversacion(conversacionSeleccionada) }}
                        </div>
                        <div>
                            <h3 class="text-xs font-extrabold text-text-main transition-colors">{{ resolverNombreConversacion(conversacionSeleccionada) }}</h3>
                            <p class="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-wider font-semibold transition-colors">
                                {{ resolverRolSubtitulo(conversacionSeleccionada) }}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="flex h-2 w-2 relative shrink-0">
                            <span :class="isConnectedReal ? 'bg-green-500' : 'bg-amber-500'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                            <span :class="isConnectedReal ? 'bg-green-500' : 'bg-amber-500'" class="relative inline-flex rounded-full h-2 w-2"></span>
                        </span>
                        <span class="text-[10px] font-semibold text-text-muted transition-colors select-none">
                            {{ isConnectedReal ? 'Conexión Segura' : 'Conectando...' }}
                        </span>
                    </div>
                </div>

                <!-- Área de Mensajes -->
                <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="contenedorMensajes">
                    
                    <!-- Paginador con Bucket Pattern (Botón superior 'Cargar más') -->
                    <div v-if="tieneMasMensajes" class="flex justify-center py-2">
                        <button 
                            @click="cargarMensajesAnteriores" 
                            :disabled="cargandoMasMensajes"
                            class="px-4 py-1.5 bg-sidebar hover:bg-bg-hover text-blue-500 border border-border-main/50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <svg v-if="cargandoMasMensajes" class="animate-spin h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
                            </svg>
                            <span>{{ cargandoMasMensajes ? 'Cargando...' : '🗂️ Cargar mensajes anteriores' }}</span>
                        </button>
                    </div>

                    <div v-if="cargandoHistorial" class="flex justify-center py-10">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>

                    <!-- Mensajes Pintados -->
                    <template v-else>
                        <div 
                            v-for="msg in mensajes" 
                            :key="msg.timestamp" 
                            :class="['flex', msg.sender_id === miUsuarioId ? 'justify-end' : 'justify-start']"
                        >
                            <div class="flex flex-col gap-0.5 max-w-[70%]">
                                <!-- Nombre del remitente en chats grupales -->
                                <span 
                                    v-if="(conversacionSeleccionada.is_group || conversacionSeleccionada.type === 'group') && msg.sender_id !== miUsuarioId"
                                    class="text-[9px] font-extrabold text-text-muted uppercase tracking-wider ml-1"
                                >
                                    {{ msg.sender_name }}
                                </span>
                                
                                <div :class="['px-4 py-2.5 shadow-sm relative group transition-all', 
                                             msg.sender_id === miUsuarioId 
                                             ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                             : 'bg-sidebar border border-border-main text-text-main rounded-2xl rounded-tl-sm']">
                                    
                                    <p class="text-xs leading-relaxed break-words font-medium">{{ msg.content }}</p>
                                    
                                    <div :class="['text-[9px] mt-1 text-right flex items-center justify-end gap-1 font-semibold select-none', msg.sender_id === miUsuarioId ? 'text-blue-200' : 'text-text-muted']">
                                        {{ formatearHora(msg.timestamp) }}
                                        
                                        <!-- Ticks de Visto (Esmeralda para Leído, Blanco Opaco para Enviado) -->
                                        <span v-if="msg.sender_id === miUsuarioId">
                                            <svg :class="esMensajeLeido(msg) ? 'text-emerald-300 drop-shadow-sm scale-110 font-bold' : 'text-white/40'" class="w-3.5 h-3.5 stroke-[2.5] transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7m-14 0l4 4L19 7"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Caja de Input de Texto -->
                <div class="p-4 bg-sidebar border-t border-border-main shrink-0 transition-colors">
                    <form @submit.prevent="enviarMensaje" class="flex gap-3 items-end max-w-5xl mx-auto">
                        <input 
                            type="text" 
                            v-model="nuevoMensajeText" 
                            placeholder="Escribí un mensaje..." 
                            class="flex-1 px-4 py-3 bg-bg-main border border-border-main rounded-xl text-xs text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-text-muted"
                        >
                        <button 
                            type="submit" 
                            :disabled="!nuevoMensajeText.trim() || !isConnectedReal" 
                            class="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center"
                        >
                            <svg class="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                            </svg>
                        </button>
                    </form>
                </div>

            </template>

            <!-- Sin Chat Abierto -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                <div class="max-w-md bg-sidebar/60 border border-border-main/50 backdrop-blur-md p-8 rounded-3xl shadow-xl space-y-4">
                    <div class="w-16 h-16 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                        💬
                    </div>
                    <div class="space-y-1">
                        <h2 class="text-sm font-extrabold text-text-main">Salas de Chat CRM</h2>
                        <p class="text-xs text-text-muted">Iniciá un chat directo con cualquier colaborador o crea un canal de grupo para coordinar con tu equipo en tiempo real.</p>
                    </div>
                </div>
            </div>
            
        </div>
    </div>

    <!-- Modal para crear nuevo grupo -->
    <div 
        v-if="mostrarModalGrupo" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
        <div class="bg-sidebar border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 transition-colors">
            <div class="flex justify-between items-center border-b border-border-main pb-3">
                <h3 class="text-sm font-extrabold text-text-main">Crear Chat Grupal</h3>
                <button @click="mostrarModalGrupo = false" class="text-text-muted hover:text-text-main text-sm">✖</button>
            </div>
            
            <div class="space-y-4">
                <div class="space-y-1.5">
                    <label class="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Nombre del Grupo</label>
                    <input 
                        type="text" 
                        v-model="nombreGrupo" 
                        placeholder="Ej: Equipo Comercial 🚀" 
                        class="w-full px-3 py-2 bg-bg-main border border-border-main rounded-xl text-xs text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                </div>

                <!-- Buscador rápido en la creación de grupo -->
                <div class="space-y-1.5 relative">
                    <label class="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Agregar Integrantes</label>
                    <input 
                        type="text" 
                        v-model="busquedaColaborador" 
                        placeholder="Buscar compañero a agregar..." 
                        class="w-full px-3 py-2 bg-bg-main border border-border-main rounded-xl text-xs text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                    
                    <!-- Resultados del buscador dentro del modal -->
                    <div 
                        v-if="resultadosBusqueda.length > 0 && mostrarModalGrupo" 
                        class="absolute left-0 right-0 bg-sidebar border border-border-main rounded-xl mt-1 max-h-40 overflow-y-auto shadow-xl z-50"
                    >
                        <div 
                            v-for="colab in resultadosBusqueda" 
                            :key="colab.id"
                            @click="() => {
                                if (!participantesGrupo.includes(colab.id)) {
                                    participantesGrupo.push(colab.id);
                                }
                                busquedaColaborador = '';
                                resultadosBusqueda = [];
                            }"
                            class="p-2 flex items-center gap-2 hover:bg-bg-hover cursor-pointer transition-colors text-xs font-semibold"
                        >
                            <span class="w-6 h-6 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full flex items-center justify-center text-[10px] uppercase font-bold shrink-0">
                                {{ colab.nombre.charAt(0) }}
                            </span>
                            <span class="text-xs text-text-main truncate">{{ colab.nombre }} {{ colab.apellido }}</span>
                        </div>
                    </div>
                </div>

                <!-- Lista de agregados temporalmente -->
                <div v-if="participantesGrupo.length > 0" class="space-y-2">
                    <label class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Participantes seleccionados:</label>
                    <div class="flex flex-wrap gap-1.5">
                        <span 
                            v-for="id in participantesGrupo" 
                            :key="id"
                            class="px-2.5 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-500 text-[10px] font-bold rounded-lg flex items-center gap-1.5 select-none"
                        >
                            <span>Usuario ID #{{ id }}</span>
                            <button @click="participantesGrupo = participantesGrupo.filter(pid => pid !== id)" class="hover:text-red-500 font-extrabold text-[9px]">✖</button>
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-border-main">
                <button 
                    @click="mostrarModalGrupo = false" 
                    class="px-4 py-2 border border-border-main hover:bg-bg-hover text-text-main rounded-xl text-xs font-semibold transition"
                >
                    Cancelar
                </button>
                <button 
                    @click="ejecutarCreacionGrupo" 
                    :disabled="!nombreGrupo.trim() || participantesGrupo.length === 0 || cargandoCreacionGrupo"
                    class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                >
                    <svg v-if="cargandoCreacionGrupo" class="animate-spin h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
                    </svg>
                    <span>Crear Grupo</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>