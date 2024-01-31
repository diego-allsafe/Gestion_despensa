var listaDespensa = [];
var articulosExistentes = [];

function agregarArticulo() {
  var categoria = document.getElementById("categoria").value;
  var articuloInput = document.getElementById("articulo");
  var cantidad = document.getElementById("cantidad").value;
  var unidadMedida = document.getElementById("unidad-medida").value;
  var fechaCompra = document.getElementById("fecha-compra").value;
  var fechaVencimiento = document.getElementById("fecha-vencimiento").value;
  var costo = document.getElementById("costo").value;

  var articulo = articuloInput.value.toLowerCase();

  if (
    articulo &&
    cantidad &&
    unidadMedida &&
    fechaCompra &&
    fechaVencimiento &&
    costo
  ) {
    var nuevoArticulo = {
      categoria: categoria,
      articulo: articulo,
      cantidad: cantidad,
      unidadMedida: unidadMedida,
      fechaCompra: fechaCompra,
      fechaVencimiento: fechaVencimiento,
      costo: parseFloat(costo),
    };

    listaDespensa.push(nuevoArticulo);

    // Agregar el artículo a la lista de existentes solo si no existe
    if (!articulosExistentes.includes(articulo)) {
      articulosExistentes.push(articulo);
    }

    document.getElementById("formulario-despensa").reset();
    actualizarListaVisual();
  } else {
    alert("Por favor, complete todos los campos.");
  }
}

function actualizarListaVisual() {
  var tablaDespensa = document.getElementById("tabla-despensa-body");
  tablaDespensa.innerHTML = "";

  var totalGeneral = 0;
  var totalPorCategoria = {};
  var categoriaActual = null;

  listaDespensa.sort((a, b) => {
    if (a.categoria !== b.categoria) {
      return a.categoria.localeCompare(b.categoria);
    } else {
      return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
    }
  });

  listaDespensa.forEach(function (articulo, index) {
    var nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
      <td>${articulo.categoria}</td>
      <td>${articulo.articulo}</td>
      <td>${articulo.cantidad}</td>
      <td>${articulo.unidadMedidaAbreviada}</td>
      <td>${formatoFecha(articulo.fechaCompra)}</td>
      <td>${formatoFecha(articulo.fechaVencimiento)}</td>
      <td>${articulo.costo.toFixed(2)}</td>
      <td><button onclick="eliminarArticulo(${index})">Eliminar</button></td>
    `;

    // Verificar si el artículo está vencido o a punto de vencer en los próximos 30 días
    var fechaVencimiento = new Date(articulo.fechaVencimiento);
    var hoy = new Date();
    var diasRestantes = Math.ceil(
      (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes <= 0 || (diasRestantes > 0 && diasRestantes <= 30)) {
      nuevaFila.classList.add("vencido");
    }

    if (diasRestantes > 0 && diasRestantes <= 30) {
      nuevaFila.classList.add("a-vencer");
    }

    tablaDespensa.appendChild(nuevaFila);

    if (!totalPorCategoria[articulo.categoria]) {
      totalPorCategoria[articulo.categoria] = 0;
    }
    totalPorCategoria[articulo.categoria] += articulo.costo;

    if (
      index === listaDespensa.length - 1 ||
      listaDespensa[index + 1].categoria !== categoriaActual
    ) {
      var nuevaFilaTotalCategoria = document.createElement("tr");
      nuevaFilaTotalCategoria.innerHTML = `
        <td colspan="3"></td>
        <td><strong>Total ${categoriaActual}</strong></td>
        <td><strong>${totalPorCategoria[categoriaActual].toFixed(
          2
        )}</strong></td>
        <td></td>
        <td></td>
        <td></td>
      `;
      tablaDespensa.appendChild(nuevaFilaTotalCategoria);
    }

    totalGeneral += articulo.costo;
  });

  var nuevaFilaTotalGeneral = document.createElement("tr");
  nuevaFilaTotalGeneral.innerHTML = `
    <td colspan="3"></td>
    <td><strong>Total General</strong></td>
    <td><strong>${totalGeneral.toFixed(2)}</strong></td>
    <td></td>
    <td></td>
    <td></td>
  `;

  tablaDespensa.appendChild(nuevaFilaTotalGeneral);

  localStorage.setItem("listaDespensa", JSON.stringify(listaDespensa));
  localStorage.setItem(
    "articulosExistentes",
    JSON.stringify(articulosExistentes)
  );
}

function imprimirLista() {
  window.print();
}

function eliminarArticulo(index) {
  listaDespensa.splice(index, 1);
  actualizarListaVisual();
}

function formatoFecha(fecha) {
  var partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

window.onload = function () {
  var storedList = localStorage.getItem("listaDespensa");
  var storedArticulosExistentes = localStorage.getItem("articulosExistentes");

  if (storedList) {
    listaDespensa = JSON.parse(storedList);
  }

  if (storedArticulosExistentes) {
    articulosExistentes = JSON.parse(storedArticulosExistentes);
  }

  actualizarListaVisual();
};

// Código para el autocompletado
document.addEventListener("DOMContentLoaded", function () {
  var articuloInput = document.getElementById("articulo");
  new Awesomplete(articuloInput, {
    list: articulosExistentes,
    minChars: 1,
    autoFirst: true,
  });
});
