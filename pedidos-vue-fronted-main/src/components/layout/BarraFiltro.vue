<template>
    <aside class="filter-sidebar">
    <div class="filter-section">
        
        
        <h3 class="badge fondo">Categoría</h3>
        <div class="brand-filter">
            <input type="checkbox" id="nike">
            <label for="nike"><i class=" "></i> Camisas</label>
        </div>
        <div class="brand-filter">
            <input type="checkbox" id="adidas">
            <label for="adidas"><i class=" "></i> Chumbis</label>
        </div>
        <div class="brand-filter">
            <input type="checkbox" id="puma">
            <label for="puma"><i class=""></i> Anaco</label>
        </div>
    </div>

    <div class="filter-section">
        <h3 class="badge fondo">Precio</h3>
        <input type="range" min="0" max="10000" value="50" class="price-range w-100 ">
        <div class="price-values ">
            <span class=" px-2  ">$0</span>
            <span>$100</span>
        </div>
    </div>

    <div class="filter-section">
        <h3 class="badge fondo"><i class=""></i> Talla</h3>
        <div class="size-filters">
            <button class="size-btn">XS</button>
            <button class="size-btn">S</button>
            <button class="size-btn">M</button>
            <button class="size-btn">L</button>
            <button class="size-btn">XL</button>
        </div>
    </div>
</aside>
  </template>
  
  <style scoped>
.fondo{
    background: #dc8e35;
}
  .filter-sidebar {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.filter-section {
    margin-bottom: 2rem;
    
}

.filter-section h3 {
    
    margin-bottom: 1rem;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.brand-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
}

.size-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.size-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: none;
    border-radius: 20px;
    cursor: pointer;
}

.size-btn:hover {
    background: #f0f0f0;
}


  </style>