import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('order', () => {
  // Estado principal del pedido
  const pedido = ref({
    cliente: {
      id: null, 
      nombre: '',
      email: '',
      telefono: '',
      direccion: {
        pais: '',
        ciudad: '',
        ciudad_id: null, 
        precioFijoCiudad: 0,
        direccionCompleta: '',
        codigoPostal: '',
        referencia: ''
      }
    },
    envio: {
      tipo: null, // 'Envío Nacional' o 'Retiro tienda Física'
      precio: 0,
      fechaEntrega: '',
      pesoTotal: 0
    },
    productos: [],
    precio_por_kg: '',
    subtotal: 0,      // Suma de precios finales (54+54+54)
    descuentos: [],   // Array de descuentos aplicados
    total: 0,         // subtotal + envio
    estado: 'pendiente',
    notas: '',
    cuposActuales: {
      cupo_6: 0,
      cupo_15: 0,
      cupo_30: 0
    },
    fechaCreacion: new Date().toISOString()
  })


  
 const resumen = computed(() => {
  // Datos seguros (evitan undefined)
  const productos = pedido.value.productos || [];
  const precioPorKg = parseFloat(pedido.value.precio_por_kg) || 0;

  // 1. Subtotal (precio unitario × cantidad) - SIN descuentos
  const subtotal = productos.reduce((sum, p) => {
    const precio = parseFloat(p.precioUnitario || p.precio || 0);
    const cantidad = parseInt(p.cantidad || 0);
    return sum + (precio * cantidad);
  }, 0);

  // 2. Peso total (kg)
  const pesoTotal = productos.reduce((sum, p) => {
    const peso = parseFloat(p.peso || 0);
    return sum + (peso * parseInt(p.cantidad || 0));
  }, 0);

  // 3. Descuentos
  const descuentos = pedido.value.descuentos || [];
  const descuento = descuentos.reduce((sum, d) => sum + parseFloat(d.total || 0), 0);

  // 4. Calcular envío según tipo
  let envio = 0;
  if (pedido.value.envio?.tipo === 'Envío Nacional') {
    const costoFijoCiudad = parseFloat(pedido.value.envio?.precioFijoCiudad) || 0; 
    envio = (pesoTotal * precioPorKg) + costoFijoCiudad;
  }
  // Si es 'Retiro tienda Física', envio queda en 0

  // 5. Total según tipo de envío
  let total;
  if (pedido.value.envio?.tipo === 'Retiro tienda Física') {
    total = subtotal - descuento; // Solo subtotal - descuentos
  } else {
    total = subtotal + envio - descuento; // Subtotal + envío - descuentos
  }

  // Resultado final
  return {
    cliente: { ...(pedido.value.cliente || {}) },
    envio: {
      tipo: pedido.value.envio?.tipo || null,
      precio: envio,
      fechaEntrega: pedido.value.envio?.fechaEntrega || '',
      pesoTotal: pesoTotal
    },
    productos: productos,
    totales: {
      subtotal: subtotal,
      descuento: descuento,
      envio: envio,
      total: total
    },
    cantidadTotal: pedido.value.productos.reduce((sum, p) => sum + parseInt(p.cantidad || 0), 0),
    estado: pedido.value.estado || 'pendiente',
    notas: pedido.value.notas || '',
    cuposActuales: { ...pedido.value.cuposActuales }
  };
});
  // Actions
  const agregarProducto = (producto) => {
    if (Array.isArray(producto)) {
      producto.forEach(p => agregarProductoIndividual(p))
    } else {
      agregarProductoIndividual(producto)
    }
  }
  
  const agregarProductoIndividual = (producto) => {
    const existente = pedido.value.productos.find(p => 
      p.id === producto.id && 
      p.talla === producto.talla && 
      p.color === producto.color
    )

    if (existente) {
      Object.assign(existente, producto)
    } else {
      pedido.value.productos.push(producto)
    }
    
    // Actualizar cálculos
    actualizarTotales()
  }

  const inicializarDesdeCarrito = (carritoData) => {
    pedido.value = {
      ...pedido.value,
      productos: carritoData.productos || [],
      descuentos: carritoData.descuentos || [],
      envio: carritoData.envio ? {
        tipo: carritoData.envio.tipo,
        precio: carritoData.envio.precio || 0,
        fechaEntrega: carritoData.envio.fechaEntrega || '',
        pesoTotal: 0
      } : pedido.value.envio,
      cuposActuales: carritoData.cuposActuales || { ...pedido.value.cuposActuales }
    }
    
    actualizarTotales()
  }

  const eliminarProducto = (productoId, talla, color) => {
    pedido.value.productos = pedido.value.productos.filter(
      p => !(p.id === productoId && p.talla === talla && p.color === color)
    )
    actualizarTotales()
  }
  
  const actualizarCantidad = (productoId, talla, color, cantidad) => {
    const producto = pedido.value.productos.find(
      p => p.id === productoId && p.talla === talla && p.color === color
    )
    if (producto) {
      producto.cantidad = cantidad
      actualizarTotales()
    }
  }

  const actualizarEnvio = (tipo, precioFijoCiudad) => {
  pedido.value.envio.tipo = tipo
  pedido.value.envio.precioFijoCiudad = precioFijoCiudad 
  actualizarTotales()
 }

  const actualizarDireccion = (direccion) => {
    pedido.value.cliente.direccion = { ...pedido.value.cliente.direccion, ...direccion };
    if (direccion.ciudad) {
    pedido.value.envio.ciudad = direccion.ciudad;
  }
  if (direccion.ciudad_id) {
      pedido.value.cliente.direccion.ciudad_id = direccion.ciudad_id;
    }
  }

  const actualizarFechaEntrega = (fecha) => {
    pedido.value.envio.fechaEntrega = fecha
  }

  const aplicarDescuentos = (descuentos) => {
    pedido.value.descuentos = descuentos
    actualizarTotales()
  }

  const actualizarPrecioPorKg = (precio) => {
    pedido.value.precio_por_kg = precio
    actualizarTotales()
  }

  
const actualizarTotales = () => {
  // 1. Peso total
  pedido.value.envio.pesoTotal = pedido.value.productos.reduce(
    (sum, p) => sum + (parseFloat(p.peso || 0) * parseInt(p.cantidad || 0)), 0
  );

  // 2. Subtotal (precio unitario × cantidad) - SIN descuentos
  pedido.value.subtotal = pedido.value.productos.reduce(
    (sum, p) => sum + (parseFloat(p.precioUnitario || 0) * parseInt(p.cantidad || 0)), 0
  );

  // 3. Calcular descuento total
  const descuentoTotal = pedido.value.descuentos.reduce((sum, d) => sum + parseFloat(d.total || 0), 0);

  // 4. Calcular según tipo de envío
  if (pedido.value.envio.tipo === 'Retiro tienda Física') {
    // Para retiro en tienda: Solo subtotal - descuentos (SIN envío)
    pedido.value.envio.precio = 0; // No hay costo de envío
    pedido.value.total = pedido.value.subtotal - descuentoTotal;
    
  } else if (pedido.value.envio.tipo === 'Envío Nacional') {
    const costoEnvioPorPeso = pedido.value.envio.pesoTotal * parseFloat(pedido.value.precio_por_kg || 0);
    const costoFijoCiudad = parseFloat(pedido.value.envio.precioFijoCiudad || 0); 
    pedido.value.envio.precio = costoEnvioPorPeso + costoFijoCiudad;
    
    pedido.value.total = pedido.value.subtotal + pedido.value.envio.precio - descuentoTotal;
  } else {
    // Tipo de envío no definido
    pedido.value.envio.precio = 0;
    pedido.value.total = pedido.value.subtotal - descuentoTotal;
  }
};

  const actualizarCliente = (datosCliente) => {
    pedido.value.cliente = { ...pedido.value.cliente, ...datosCliente }
  }

  const actualizarNotas = (notas) => {
    pedido.value.notas = notas
  }

  const actualizarCupos = (cupos) => {
    pedido.value.cuposActuales = { ...cupos }
  }

const prepararDatosParaEnvio = () => {
  return {
    usuario_id: pedido.value.cliente.id,
    productos: pedido.value.productos.map(producto => ({
      detalles_productos_id: producto.id,
      cantidad: producto.cantidad,
      talla_id: producto.talla_id 
    })),
    tipo_envio: pedido.value.envio.tipo,
    ciudad_envio_id: pedido.value.cliente.direccion.ciudad_id,
    direccion: pedido.value.cliente.direccion.direccionCompleta,
    referencia: pedido.value.cliente.direccion.referencia
  }
}
  const limpiarPedido = () => {
    pedido.value = {
      cliente: {
        id: null,
        nombre: '',
        email: '',
        telefono: '',
        direccion: {
          pais: '',
          ciudad: '',
          ciudad_id: null,
          direccionCompleta: '',
          codigoPostal: '',
          referencia: ''
        }
      },
      envio: {
        tipo: null,
        precio: 0,
        fechaEntrega: '',
        pesoTotal: 0
      },
      productos: [],
      subtotal: 0,
      descuentos: [],
      total: 0,
      estado: 'pendiente',
      notas: '',
      cuposActuales: {
        cupo_6: 0,
        cupo_15: 0,
        cupo_30: 0
      },
      fechaCreacion: new Date().toISOString()
    }
  }

  return {
    pedido,
    resumen,
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    actualizarEnvio,
    actualizarDireccion,
    actualizarFechaEntrega,
    aplicarDescuentos,
    actualizarCliente,
    actualizarNotas,
    actualizarCupos,
    actualizarTotales,
    actualizarPrecioPorKg,
    limpiarPedido,
    inicializarDesdeCarrito,
    prepararDatosParaEnvio
  }
},
{
  // Configuración de persistencia
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'order', 
        storage: localStorage, 
        paths: ['pedido', 'resumen'] 
      }
    ]
  }
}
)