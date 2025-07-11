<?php

namespace App\Http\Controllers\Pedidos;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Orden;
use App\Models\Talla;
use App\Models\Descuento;
use App\Models\CiudadEnvio;
use App\Models\DetalleEnvio;
use App\Models\DetalleOrden;
use Illuminate\Http\Request;
use App\Models\DetalleProducto;
use App\Services\PayPalService;
use App\Models\ConfiguracionEnvio;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use App\Notifications\NuevoPedidoNotification;
use App\Notifications\OrdenPagadaNotification;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;

class OrdenController extends Controller
{
   
   

    public function listarOrdenes(Request $request)
    
    {
        // filtrar las órdenes por estado, por ejemplo:
        $estado = $request->query('estado', null); // El parámetro 'estado' es opcional

        // Obtener las órdenes, opcionalmente filtradas por estado
        $query = Orden::with('detallesConTallasYColores'); // Carga las órdenes junto con los detalles (productos con tallas y colores)

        if ($estado) {
            // Si hay un estado proporcionado, filtramos las órdenes por ese estado
            $query->where('estado', $estado);
        }

        // Obtener las órdenes 
        $ordenes = $query->get();

        // Responder con las órdenes
        return response()->json([
            'ordenes' => $ordenes
        ]);
    }
       
    
    public function actualizarOrden(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'estado' => 'nullable|in:Pagado,Entregando,Atrasado',
                'estado_pago' => 'nullable|in:pendiente,completado',
            ]);

            return DB::transaction(function () use ($id, $validated, $request) {
                // $orden = Orden::lockForUpdate()->findOrFail($id);
                $orden = Orden::with('usuario')->lockForUpdate()->findOrFail($id);
                $estadoAnterior = $orden->estado;

                if ($request->has('estado')) {
                    $orden->estado = $validated['estado'];
                }
                if ($request->has('estado_pago')) {
                    $orden->estado_pago = $validated['estado_pago'];
                }

                $orden->save();

                if ($estadoAnterior !== $orden->estado) {
                    $orden->notifyStatusUpdate();
                }

                return response()->json([
                    'message' => 'Orden actualizada exitosamente',
                    'orden' => $orden->fresh()
                ], 200);
            });

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'message' => 'Error al actualizar la orden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function eliminarOrden($id)
    {
        $orden = Orden::find($id);

        if (!$orden) {
            return response()->json(['message' => 'Orden no encontrada'], 404);
        }

        $orden->detalles()->delete(); // Eliminar los detalles primero
        $orden->delete(); // Luego eliminar la orden

        return response()->json(['message' => 'Orden eliminada exitosamente'], 200);
    }

    
    public function listarOrdenesPorUsuario($usuario_id)
    {
        // Obtener todas las órdenes del usuario con los detalles (productos, tallas, y colores)
        $ordenes = Orden::where('usuario_id', $usuario_id)
                        ->with('detallesConTallasYColores') // Cargar los detalles de productos con tallas y colores
                        ->get();
    
        // Verificar si el usuario tiene órdenes
        if ($ordenes->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron órdenes para este usuario.'
            ], 404);
        }
    
        return response()->json([
            'message' => 'Órdenes del usuario obtenidas exitosamente.',
            'ordenes' => $ordenes
        ], 200);
    }
    
   

    public function obtenerOrdenesPorUsuario(Request $request, $usuarioId)
    {
        // Validar que el usuario existe
        $usuario = User::find($usuarioId);

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        // Obtener todas las órdenes del usuario con sus detalles
        $ordenes = Orden::where('usuario_id', $usuarioId)
            ->with(['detallesOrden.detalleProducto.producto'])
            ->get();

        // Retornar las órdenes con su información
        return response()->json([
            'message' => 'Órdenes recuperadas exitosamente.',
            'ordenes' => $ordenes
        ]);
    }

    public function listarFechas(Request $request)
    {
        // Filtrar las órdenes por estado
        $estado = $request->query('estado', null); // El parámetro 'estado' es opcional

        // Consultar las órdenes incluyendo el usuario y filtrando solo los campos necesarios
        $query = Orden::query()->with(['usuario:id,nombre']); // Traer solo 'id' y 'nombre' del usuario

        if ($estado) {
            // Filtrar las órdenes por estado si está definido
            $query->where('estado', $estado);
        }

        // Seleccionar únicamente las columnas necesarias de las órdenes
        $ordenes = $query->select('id', 'fecha_entrega', 'usuario_id')->get();

        // Mapear los datos para estructurar el resultado
        $resultado = $ordenes->map(function ($orden) {
            return [
                'fecha_entrega' => $orden->fecha_entrega,
                'usuario' => $orden->usuario ? $orden->usuario->nombre : null, // Devolver 'nombre' si existe el usuario
            ];
        });

        // Responder con los datos procesados
        return response()->json([
            'ordenes' => $resultado
        ]);
    }

    
    
    
    private function calcularFeriadosEcuador(int $año): array
    {
        $feriados = [];
        
        // Feriados fijos
        $feriados = array_merge($feriados, [
            "$año-01-01", // Año Nuevo
            "$año-05-01", // Día del Trabajo
            "$año-05-24", // Batalla de Pichincha
            "$año-08-10", // Primer Grito de Independencia
            "$año-10-09", // Independencia de Guayaquil
            "$año-11-02", // Día de Difuntos
            "$año-11-03", // Independencia de Cuenca
            "$año-12-25", // Navidad
        ]);

        // Carnaval (48 y 47 días antes de Pascua)
        $pascua = Carbon::createFromFormat('Y-m-d', date('Y-m-d', easter_date($año)));
        $feriados[] = $pascua->copy()->subDays(48)->format('Y-m-d'); // Lunes Carnaval
        $feriados[] = $pascua->copy()->subDays(47)->format('Y-m-d'); // Martes Carnaval

        // Semana Santa
        $feriados[] = $pascua->copy()->subDays(2)->format('Y-m-d'); // Viernes Santo

        return $feriados;
    }

    private function getCuposDiarios()
    {
        $fechaHoy = Carbon::now()->format('Y-m-d');
        $cacheKey = "cupos_" . $fechaHoy;
        
        if (!Cache::has($cacheKey)) {
            Cache::put($cacheKey, [
                'cupo_6' => 0,
                'cupo_15' => 0,
                'cupo_30' => 0
            ], Carbon::now()->endOfDay());
        }
        
        return Cache::get($cacheKey);
    }

    private function actualizarCupos($cupos)
    {
        $fechaHoy = Carbon::now()->format('Y-m-d');
        $cacheKey = "cupos_" . $fechaHoy;
        Cache::put($cacheKey, $cupos, Carbon::now()->endOfDay());
    }

    private function calcularDiasHabiles(Carbon $fecha, int $diasAgregar)
    {
        $diasContados = 0;
        while ($diasContados < $diasAgregar) {
            $fecha->addDay();
            $añoActual = $fecha->year;
            $feriadosAñoActual = $this->calcularFeriadosEcuador($añoActual);
            
            if ($fecha->year !== $añoActual) {
                $feriadosAñoActual = array_merge(
                    $feriadosAñoActual,
                    $this->calcularFeriadosEcuador($fecha->year)
                );
            }

            if (!$fecha->isWeekend() && !in_array($fecha->format('Y-m-d'), $feriadosAñoActual)) {
                $diasContados++;
            }
        }
        return $fecha;
    }

    public function calcularFechaEntrega(Request $request)
    {
        // Validación directa del valor
        $cantidad = $request->input('cantidad');
        
        if (!is_numeric($cantidad)) {
            return response()->json([
                'status' => 'error',
                'message' => 'La cantidad debe ser un número.',
                'cantidad_solicitada' => $cantidad
            ], 400);
        }

        $cantidad = (int) $cantidad;

        if ($cantidad > 30 || $cantidad < 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'La cantidad debe estar entre 1 y 30 prendas.',
                'cantidad_solicitada' => $cantidad
            ], 400);
        }

        // Obtener cupos actuales
        $cuposDiarios = $this->getCuposDiarios();

        // Verificar disponibilidad en cupos
        $fechaEntrega = null;
        $mensaje = '';

        // Intentar asignar al cupo de 6
        if ($cantidad <= 6 && ($cuposDiarios['cupo_6'] + $cantidad) <= 6) {
            $cuposDiarios['cupo_6'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 3);
            $mensaje = "Asignado al cupo de 6 prendas (3 días hábiles)";
        }
        // Intentar asignar al cupo de 15
        elseif ($cantidad <= 15 && ($cuposDiarios['cupo_15'] + $cantidad) <= 15) {
            $cuposDiarios['cupo_15'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 6);
            $mensaje = "Asignado al cupo de 15 prendas (6 días hábiles)";
        }
        // Intentar asignar al cupo de 30
        elseif ($cantidad <= 30 && ($cuposDiarios['cupo_30'] + $cantidad) <= 30) {
            $cuposDiarios['cupo_30'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 12);
            $mensaje = "Asignado al cupo de 30 prendas (12 días hábiles)";
        }

        if (!$fechaEntrega) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lo sentimos, todos los cupos del día están llenos. Por favor, intente mañana cuando se reinicien los cupos.',
                'cupos_actuales' => $cuposDiarios
            ], 400);
        }

        //    $this->actualizarCupos($cuposDiarios);

        return response()->json([
            'status' => 'success',
            'mensaje' => $mensaje,
            'fecha_entrega' => $fechaEntrega->format('Y-m-d'),
            'cantidad_prendas' => $cantidad,
            'cupos_actuales' => $cuposDiarios
        ]);
    }

    public function calcularFechaEntregaInterna($cantidad)
    {
        // Validación directa del valor
        if (!is_numeric($cantidad)) {
            return response()->json([
                'status' => 'error',
                'message' => 'La cantidad debe ser un número.',
                'cantidad_solicitada' => $cantidad
            ], 400); // Código 400 para solicitud incorrecta
        }
    
        $cantidad = (int) $cantidad;
    
        if ($cantidad > 30 || $cantidad < 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'La cantidad debe estar entre 1 y 30 prendas.',
                'cantidad_solicitada' => $cantidad
            ], 400); // Código 400 para solicitud incorrecta
        }
    
        // Obtener cupos actuales
        $cuposDiarios = $this->getCuposDiarios();
    
        // Verificar disponibilidad en los cupos
        $fechaEntrega = null;
        $mensaje = '';
    
        // Intentar asignar al cupo de 6
        if ($cantidad <= 6 && ($cuposDiarios['cupo_6'] + $cantidad) <= 6) {
            $cuposDiarios['cupo_6'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 3);
            $mensaje = "Asignado al cupo de 6 prendas (3 días hábiles)";
        }
        // Intentar asignar al cupo de 15
        elseif ($cantidad <= 15 && ($cuposDiarios['cupo_15'] + $cantidad) <= 15) {
            $cuposDiarios['cupo_15'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 6);
            $mensaje = "Asignado al cupo de 15 prendas (6 días hábiles)";
        }
        // Intentar asignar al cupo de 30
        elseif ($cantidad <= 30 && ($cuposDiarios['cupo_30'] + $cantidad) <= 30) {
            $cuposDiarios['cupo_30'] += $cantidad;
            $fechaEntrega = $this->calcularDiasHabiles(Carbon::now(), 12);
            $mensaje = "Asignado al cupo de 30 prendas (12 días hábiles)";
        }
    
        if (!$fechaEntrega) {
            // Cuando no hay disponibilidad
            return response()->json([
                'status' => 'error',
                'message' => 'Lo sentimos, todos los cupos del día están llenos. Por favor, intente mañana cuando se reinicien los cupos.',
                'cupos_actuales' => $cuposDiarios
            ], 400); // Devolviendo error 400 con el mensaje adecuado
        }
    
        // Actualizamos los cupos disponibles
        $this->actualizarCupos($cuposDiarios);
    
        // Responder con éxito y los detalles de la fecha de entrega
        return response()->json([
            'status' => 'success',
            'mensaje' => $mensaje,
            'fecha_entrega' => $fechaEntrega->format('Y-m-d'),
            'cantidad_prendas' => $cantidad,
            'cupos_actuales' => $cuposDiarios
        ]);
    }
    


    public function crearOrden(Request $request)
    {
        $this->validarEntrada($request);

        $totalProductos = $this->calcularTotalProductos($request->productos);
        
        $fecha_entrega = $this->obtenerFechaEntrega($totalProductos);

        $orden = $this->crearOrdenBase($request->usuario_id, $fecha_entrega);

        // Calcular descuentos
        $descuentosResponse = $this->calcularDescuentos($request->productos);
        $descuentosData = json_decode($descuentosResponse->getContent(), true);

        if ($descuentosData['status'] === 'error') {
            abort(400, $descuentosData['message']);
        }

        $total = $this->procesarProductosConDescuentos($orden->id, $request->productos, $descuentosData);
        
        // **NUEVO: Calcular peso total y costo de envío**
        $pesoTotal = $this->calcularPesoTotal($request->productos);
        $costoEnvio = $this->calcularCostoEnvio($request->tipo_envio, $request->ciudad_envio_id, $pesoTotal);
        
        // **NUEVO: Crear detalle de envío**
        $this->crearDetalleEnvio($orden->id, $request, $pesoTotal, $costoEnvio);
        
        $orden->update([
            'monto_total' => $total + $costoEnvio,
            'descuento_total' => $descuentosData['descuento_total']
        ]);
        // Obtener el usuario asociado a la orden
        $usuario = User::find($request->usuario_id);

        // Disparar la notificación al usuario
        $usuario->notify(new OrdenPagadaNotification($orden));
        // Obtener el administrador (puedes usar un rol o un usuario específico)
        $admins = User::where('esadmin', true)->get();

        if ($admins->isNotEmpty()) {
            $admins->each(function($admin) use ($orden) {
                $admin->notify(new NuevoPedidoNotification($orden));
            });
        }
        return response()->json([
            'mensaje' => 'Orden creada exitosamente.',
            
            'orden' => $orden->load('envio'), // Cargar la relación
            'costo_envio' => $costoEnvio,
        ]);
    }

    private function validarEntrada(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'productos' => 'required|array',
            'productos.*.detalles_productos_id' => 'required|exists:detalles_productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.talla_id' => 'required|exists:tallas,id',

             // Nuevas validaciones para envío
            'tipo_envio' => 'required|string|in:Envío Nacional,Retiro tienda Física',
            'ciudad_envio_id' => 'nullable|required_if:tipo_envio,Envío Nacional|exists:ciudad_envios,id',
            'direccion' => 'required_if:tipo_envio,Envío Nacional|string|max:255',
            'referencia' => 'nullable|string|max:255',

        ]);
    }

    private function calcularTotalProductos(array $productos): int
    {
        return array_reduce($productos, function ($carry, $producto) {
            return $carry + $producto['cantidad'];
        }, 0);
    }

    private function obtenerFechaEntrega(int $totalProductos): string
    {
        $fechaEntregaResponse = $this->calcularFechaEntregaInterna($totalProductos);
        $fechaEntregaData = json_decode($fechaEntregaResponse->getContent());

        if ($fechaEntregaData->status === 'error') {
            abort(400, $fechaEntregaData->message);
        }

        return $fechaEntregaData->fecha_entrega;
    }

    private function crearOrdenBase(int $usuarioId, string $fechaEntrega)
    {
        return Orden::create([
            'usuario_id' => $usuarioId,
            'estado' => 'Pagado',
            'monto_total' => 0,
            'fecha_entrega' => $fechaEntrega,
            'estado_pago' => 'completado',
        ]);
    }

    private function calcularDescuentos(array $productos)
    {
        $request = new Request([
            'productos' => array_map(function ($producto) {
                return [
                    'id' => $producto['detalles_productos_id'],
                    'cantidad' => $producto['cantidad']
                ];
            }, $productos)
        ]);

        return $this->aplicarDescuento($request);
    }

    private function procesarProductosConDescuentos(int $ordenId, array $productos, array $descuentosData): float
    {
        $total = 0;

        foreach ($productos as $producto) {
            $detalle_producto = DetalleProducto::find($producto['detalles_productos_id']);
            $talla = Talla::find($producto['talla_id']);

            if (!$detalle_producto || !$talla) {
                abort(400, 'Producto o talla no válido');
            }

            // Buscar el producto en la respuesta de descuentos
            $productoConDescuento = collect($descuentosData['productos'])->firstWhere('producto_id', $producto['detalles_productos_id']);

            if (!$productoConDescuento) {
                abort(400, 'Producto no encontrado en la respuesta de descuentos');
            }

            $precio_unitario = $productoConDescuento['precio_final'] / $producto['cantidad'];
            $descuento_unitario = $productoConDescuento['descuento'] / $producto['cantidad'];

            $subtotal = $this->crearDetalleOrdenConDescuento(
                $ordenId, 
                $producto['detalles_productos_id'], 
                $producto['talla_id'], 
                $producto['cantidad'], 
                $detalle_producto->precio_base,
                $precio_unitario,
                $descuento_unitario
            );

            $total += $subtotal;
        }

        return round($total, 2);
    }

    private function crearDetalleOrdenConDescuento(int $ordenId, int $productoId, int $tallaId, int $cantidad, float $precioBase, float $precioUnitario, float $descuentoUnitario): float
    {
        $subtotal = round($precioUnitario * $cantidad, 2);

        DetalleOrden::create([
            'orden_id' => $ordenId,
            'detalles_productos_id' => $productoId,
            'talla_id' => $tallaId,
            'cantidad' => $cantidad,
            'precio_base' => $precioBase,
            'precio_unitario' => $precioUnitario,
            'descuento_unitario' => $descuentoUnitario,
            'subtotal' => $subtotal,
        ]);

        return $subtotal;
    }

    public function aplicarDescuento(Request $request)
    {
        $validated = $request->validate([
            'productos' => 'required|array',
            'productos.*.id' => 'required|exists:detalles_productos,id',
            'productos.*.cantidad' => 'required|integer|min:1'
        ]);
    
        try {
            // Sumar el total de unidades compradas
            $cantidadTotal = collect($validated['productos'])->sum('cantidad');
    
            // Obtener descuentos globales
            $descuentosGlobales = Descuento::where('activo', true)
                ->where('cantidad_minima', '<=', $cantidadTotal)
                ->where('aplica_todos_productos', true)
                ->get();
    
            // Obtener IDs de productos seleccionados
            $productosIds = collect($validated['productos'])->pluck('id')->toArray();
    
            // Obtener descuentos específicos para los productos seleccionados
            $descuentosEspecificos = Descuento::where('activo', true)
                ->where('cantidad_minima', '<=', $cantidadTotal)
                ->where('aplica_todos_productos', false)
                ->whereHas('detallesProductos', function ($query) use ($productosIds) {
                    $query->whereIn('detalle_producto_id', $productosIds);
                })
                ->get();
    
            // Combinar descuentos válidos
            $descuentos = $descuentosGlobales->merge($descuentosEspecificos)
                ->filter(fn($descuento) => $descuento->esValido());
    
            // Calcular precios de los productos
            $productosConDescuento = [];
            $subtotalGeneral = 0;
    
            foreach ($validated['productos'] as $productoData) {
                $detalleProducto = DetalleProducto::find($productoData['id']);
                $subtotalProducto = $detalleProducto->precio_base * $productoData['cantidad'];
                $subtotalGeneral += $subtotalProducto;
    
                // Filtrar los descuentos específicos para este producto
                $descuentosProducto = $descuentosEspecificos->filter(function ($descuento) use ($detalleProducto) {
                    return $descuento->detallesProductos->contains('id', $detalleProducto->id);
                });
    
                // Separar descuentos por monto fijo y porcentaje
                $montoFijo = $descuentosProducto->where('tipo', 'monto_fijo')->sum(fn($descuento) => $descuento->valor);
                $porcentaje = $descuentosProducto->where('tipo', 'porcentaje')->sum('valor');
    
                // Calcular descuento total (monto fijo + porcentaje aplicado al precio base)
                $descuentoEspecifico = $montoFijo + (($porcentaje / 100) * $subtotalProducto);
    
                $productosConDescuento[] = [
                    'producto_id' => $detalleProducto->id,
                    'nombre' => $detalleProducto->producto->nombre,
                    'cantidad' => $productoData['cantidad'],
                    'precio_original' => $subtotalProducto,
                    'precio_base' => $detalleProducto->precio_base,
                    'descuento_especifico' => $descuentoEspecifico
                ];
            }
    
            // Calcular descuentos globales (separando monto fijo y porcentaje)
            $descuentoGlobalTotal = 0;
            foreach ($descuentosGlobales as $descuento) {
                if ($descuento->tipo == 'monto_fijo') {
                    $descuentoGlobalTotal += $descuento->valor * $cantidadTotal;
                } elseif ($descuento->tipo == 'porcentaje') {
                    $descuentoGlobalTotal += ($descuento->valor / 100) * $subtotalGeneral;
                }
            }
    
            // Aplicar y distribuir descuentos globales
            $descuentoTotal = 0;
            foreach ($productosConDescuento as &$producto) {
                // Aplicar descuento global proporcionalmente
                $proporcion = $producto['precio_original'] / $subtotalGeneral;
                $descuentoGlobal = round($descuentoGlobalTotal * $proporcion, 2);
    
                // Combinar descuentos globales y específicos
                $producto['descuento'] = $producto['descuento_especifico'] + $descuentoGlobal;
                $producto['precio_final'] = $producto['precio_original'] - $producto['descuento'];
                $descuentoTotal += $producto['descuento'];
    
                // Limpiar campo temporal
                unset($producto['descuento_especifico']);
            }
    
            // Respuesta con datos procesados
            return response()->json([
                'status' => 'success',
                'descuento_aplicado' => $descuentoTotal > 0,
                'cantidad_total' => $cantidadTotal,
                'descuento_total' => $descuentoTotal,
                'productos' => $productosConDescuento
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al calcular el descuento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

private function calcularPesoTotal(array $productos): float
{
    $pesoTotal = 0;
    
    foreach ($productos as $producto) {
        $detalleProducto = DetalleProducto::find($producto['detalles_productos_id']);
        
        $pesoTotal += ($detalleProducto->peso_kg ?? 0.2) * $producto['cantidad']; // 0.2kg por defecto para camisas
    }
    
    return round($pesoTotal, 2);
}

// private function calcularCostoEnvio(string $tipoEnvio, ?int $ciudadId, float $pesoTotal): float
// {
//     // Limpiar espacios para evitar problemas
//     $tipoEnvio = trim($tipoEnvio);
    
//     if ($tipoEnvio === 'Retiro tienda Física') {
//         return 0.00;
//     }
    
//     if ($tipoEnvio === 'Envío Nacional') { // SIN espacio al final
//         if (!$ciudadId) {
//             abort(400, 'Ciudad de envío requerida para envío nacional');
//         }
        
//         $ciudad = CiudadEnvio::find($ciudadId);
//         if (!$ciudad) {
//             abort(400, 'Ciudad de envío no válida');
//         }
        
//         // Obtener precio por kg
//         $configuracion = ConfiguracionEnvio::first();
//         if (!$configuracion) {
//             abort(500, 'Configuración de envío no encontrada');
//         }
        
//         $precioPorKg = $configuracion->precio_por_kg;
//         $costoTotal = ($pesoTotal * $precioPorKg) + $ciudad->precio_envio;
        
//         return round($costoTotal, 2);
//     }
    
//     return 0.00;
// }

private function calcularCostoEnvio(string $tipoEnvio, ?int $ciudadId, float $pesoTotal): float
{
    $tipoEnvio = trim($tipoEnvio);
    
    if ($tipoEnvio === 'Retiro tienda Física') {
        return 0.00;
    }
    
    if ($tipoEnvio === 'Envío Nacional') {
        // Si por alguna razón viene null, usamos la ciudad de origen
        $ciudadId = $ciudadId ?? CiudadEnvio::getCiudadOrigen();
        
        $ciudad = CiudadEnvio::find($ciudadId);
        if (!$ciudad) {
            abort(400, 'Ciudad de envío no válida');
        }
        
        $configuracion = ConfiguracionEnvio::first();
        if (!$configuracion) {
            abort(500, 'Configuración de envío no encontrada');
        }
        
        $precioPorKg = $configuracion->precio_por_kg;
        $costoTotal = ($pesoTotal * $precioPorKg) + $ciudad->precio_envio;
        
        return round($costoTotal, 2);
    }
    
    return 0.00;
}

private function crearDetalleEnvio(int $ordenId, Request $request, float $pesoTotal, float $costoEnvio): void
{
    $tipoEnvio = trim($request->tipo_envio); 
    
    DetalleEnvio::create([
        'orden_id' => $ordenId,
        'tipo_envio' => $tipoEnvio,
        'ciudad_envio_id' => $tipoEnvio === 'Envío Nacional' 
            ? $request->ciudad_envio_id 
            : CiudadEnvio::getCiudadOrigen(), 
        'direccion' => $tipoEnvio === 'Envío Nacional' 
            ? $request->direccion 
            : 'Retiro tienda Física',
        'referencia' => $request->referencia,
        'peso_total' => $pesoTotal,
        'costo_envio' => $costoEnvio,
        'estado_envio' => 'pendiente'
    ]);
}

}



