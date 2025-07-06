<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orden #<?php echo e($orden->id); ?></title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <h1>New Blessings</h1>
                <p>Riobamba Avenida 123</p>
                <p>Teléfono: (123) 456-7890</p>
                <p>Email: newblessing.riobamba@tuempresa.com</p>
            </div>
            <div class="orden-info">
                <h2>ORDEN DE COMPRA</h2>
                <div class="orden-info-details">
                    <p><strong>Orden #:</strong> <?php echo e($orden->id); ?></p>
                    <p><strong>Fecha:</strong> <?php echo e($orden->created_at->format('d/m/Y')); ?></p>
                    <p><strong>Estado:</strong> <?php echo e($orden->estado); ?></p>
                </div>
            </div>
        </div>

        <div class="cliente-info">
            <h3 class="section-title">Información del Cliente</h3>
            <p><strong>Cliente:</strong> <?php echo e($usuario->nombre); ?></p>
            <p><strong>Email:</strong> <?php echo e($usuario->email); ?></p>
            <p><strong>Fecha de Entrega:</strong> <?php echo e($orden->fecha_entrega); ?></p>
        </div>

        <h3 class="section-title">Detalles del Pedido</h3>
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Cantidad</th>
                    <th>Precio Base</th>
                    <th>Descuento</th>
                    <th>Precio Final</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = $detalles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $detalle): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($detalle->producto->nombre); ?></td>
                    <td><?php echo e($detalle->talla->nombre); ?></td>
                    <td><?php echo e($detalle->cantidad); ?></td>
                    <td>$<?php echo e(number_format($detalle->precio_base, 2)); ?></td>
                    <td>$<?php echo e(number_format($detalle->descuento_unitario, 2)); ?></td>
                    <td>$<?php echo e(number_format($detalle->precio_unitario, 2)); ?></td>
                    <td>$<?php echo e(number_format($detalle->subtotal, 2)); ?></td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>

        <div class="total-section">
            <p class="total-line"><strong>Subtotal:</strong> $<?php echo e(number_format($orden->monto_total + $orden->descuento_total, 2)); ?></p>
            <p class="total-line"><strong>Descuento Total:</strong> $<?php echo e(number_format($orden->descuento_total, 2)); ?></p>
            <p class="total-final">TOTAL: $<?php echo e(number_format($orden->monto_total, 2)); ?></p>
        </div>

        <div class="footer">
            <p>Gracias por tu compra. Si tienes alguna pregunta sobre tu orden, por favor contáctanos.</p>
            <p>Este documento es una confirmación válida de tu compra.</p>
        </div>
    </div>
</body>
</html><?php /**PATH C:\Users\HP\OneDrive - ESCUELA SUPERIOR POLITECNICA DE CHIMBORAZO\Escritorio\PAKARY\9no\APLI\ProyectoApp\pedidos-laravel-backend\resources\views\pdf\orden.blade.php ENDPATH**/ ?>