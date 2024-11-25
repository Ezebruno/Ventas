// DOM Elements
const form = document.getElementById("ventaForm");
const ventasTableBody = document.querySelector("#ventasTable tbody");
const exportarBtn = document.getElementById("exportar");
const limpiarBtn = document.getElementById("limpiar");

// Load existing sales on DOMContentLoaded
document.addEventListener("DOMContentLoaded", loadSales);

// Register sale
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form data
  const producto = document.getElementById("producto").value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseFloat(document.getElementById("precio").value);
  const porMayor = document.getElementById("porMayor").checked;

  // Validate form data
  if (!producto || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
    alert("Por favor, completa todos los campos con valores válidos.");
    return;
  }

  // Calculate total and save sale
  const total = cantidad * precio;
  const venta = { producto, cantidad, precio, total, porMayor };
  saveSale(venta);

  // Add to table
  addSaleToTable(venta);

  // Reset form and focus on the first input field
  form.reset();
  document.getElementById("producto").focus();
});

// Save a sale to localStorage
function saveSale(venta) {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.push(venta);
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

// Load sales from localStorage
function loadSales() {
  ventasTableBody.innerHTML = ""; // Clear the table
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.forEach(addSaleToTable); // Add each sale to the table
}

// Add a sale to the table
function addSaleToTable(venta) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${venta.producto}</td>
    <td>${venta.cantidad}</td>
    <td>${venta.precio.toFixed(2)}</td>
    <td>${venta.total.toFixed(2)}</td>
    <td>${venta.porMayor ? "Por Mayor" : "Por Menor"}</td>
  `;
  ventasTableBody.appendChild(row);
}

// Export sales as PDF with a table and total amount
exportarBtn.addEventListener("click", () => {
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  if (ventas.length === 0) {
    alert("No hay ventas registradas para exportar.");
    return;
  }

  // Create a jsPDF instance
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Registro de Ventas", 10, 10);

  // Generate table rows
  const tableData = ventas.map((venta, index) => [
    index + 1,
    venta.producto,
    venta.cantidad,
    `$${venta.precio.toFixed(2)}`,
    `$${venta.total.toFixed(2)}`,
    venta.porMayor ? "Por Mayor" : "Por Menor",
  ]);

  // Calculate total amount
  const totalRecaudado = ventas.reduce((sum, venta) => sum + venta.total, 0);

  // Generate the table with autoTable
  doc.autoTable({
    head: [["#", "Producto", "Cantidad", "Precio Unitario", "Total", "Tipo de Venta"]],
    body: tableData,
    startY: 20,
    theme: "striped",
  });

  // Add total amount below the table
  const finalY = doc.lastAutoTable.finalY + 10; // Position below the table
  doc.setFontSize(14);
  doc.text(`Monto Total Recaudado: $${totalRecaudado.toFixed(2)}`, 10, finalY);

  // Download the PDF
  doc.save("registro_ventas.pdf");
});

// Clear all sales
limpiarBtn.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que deseas limpiar todos los registros?")) {
    localStorage.removeItem("ventas"); // Remove sales from localStorage
    ventasTableBody.innerHTML = ""; // Clear the table on the page
    alert("Registro de ventas limpiado.");
    
    // Reset the form and focus back on the first field
    form.reset();
    document.getElementById("producto").focus();
  }
});

