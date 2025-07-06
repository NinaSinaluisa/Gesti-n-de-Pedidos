<template>
    <div>
      <p>A baseball-themed collection, a favorite of the Peanuts friends.</p>
      <p>
        <strong>$122.00</strong>
        <span class="text-muted text-decoration-line-through">$156.00</span>
      </p>
      <div class="mb-3">
        <span>Color: <strong>53 Green</strong></span>
        <div class="d-flex gap-2 mt-2">
          <div class="color-box" style="background: #355e3b"></div>
          <div class="color-box" style="background: #ddd"></div>
          <div class="color-box" style="background: #f5d6c7"></div>
        </div>
      </div>
      <div class="mb-3">
        <span>Size:</span>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-outline-secondary btn-sm">XS</button>
          <button class="btn btn-outline-secondary btn-sm active">S</button>
          <button class="btn btn-outline-secondary btn-sm">M</button>
        </div>
      </div>
      <button class="btn btn-success w-100 mb-2">+ Add to Cart</button>
      <button class="btn btn-outline-primary w-100">Buy this Item</button>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style>
  .color-box {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  </style>
  