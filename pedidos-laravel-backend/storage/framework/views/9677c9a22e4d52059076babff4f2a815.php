<?php if($paginator->hasPages()): ?>
    <nav>
        <ul class="pagination">
            
            <?php if($paginator->onFirstPage()): ?>
                <li class="disabled" aria-disabled="true"><span><?php echo app('translator')->get('pagination.previous'); ?></span></li>
            <?php else: ?>
                <li><a href="<?php echo e($paginator->previousPageUrl()); ?>" rel="prev"><?php echo app('translator')->get('pagination.previous'); ?></a></li>
            <?php endif; ?>

            
            <?php if($paginator->hasMorePages()): ?>
                <li><a href="<?php echo e($paginator->nextPageUrl()); ?>" rel="next"><?php echo app('translator')->get('pagination.next'); ?></a></li>
            <?php else: ?>
                <li class="disabled" aria-disabled="true"><span><?php echo app('translator')->get('pagination.next'); ?></span></li>
            <?php endif; ?>
        </ul>
    </nav>
<?php endif; ?>
<?php /**PATH C:\Users\HP\OneDrive - ESCUELA SUPERIOR POLITECNICA DE CHIMBORAZO\Escritorio\PAKARY\9no\APLI\ProyectoApp\pedidos-laravel-backend\vendor\laravel\framework\src\Illuminate\Pagination\resources\views\simple-default.blade.php ENDPATH**/ ?>