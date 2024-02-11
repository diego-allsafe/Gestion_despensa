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
  if (!tablaDespensa) {
    console.error("Error: No se pudo encontrar la tabla.");
    return;
  }

  tablaDespensa.innerHTML = "";

  var totalGeneral = 0;
  var totalPorCategoria = {};
  var categoriaActual = null;

  if (!listaDespensa || !Array.isArray(listaDespensa)) {
    console.error("Error: La lista de despensa no es válida.");
    return;
  }

  // Ordenar por categoría, luego por artículo y finalmente por fecha de vencimiento
  listaDespensa.sort((a, b) => {
    if (a.categoria !== b.categoria) {
      return a.categoria.localeCompare(b.categoria);
    } else if (a.articulo !== b.articulo) {
      return a.articulo.localeCompare(b.articulo);
    } else {
      return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
    }
  });

  listaDespensa.forEach(function (articulo, index) {
    if (articulo.categoria !== categoriaActual) {
      categoriaActual = articulo.categoria;
      var espacioCategoria = document.createElement("tr");
      espacioCategoria.innerHTML = `
        <td colspan="7"><strong>${categoriaActual}</strong></td>
      `;
      tablaDespensa.appendChild(espacioCategoria);
    }

    var nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
      <td>${articulo.categoria}</td>
      <td>${articulo.articulo}</td>
      <td>${articulo.cantidad}</td>
      <td>${articulo.unidadMedida}</td>
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
      totalPorCategoria[articulo.categoria] = {};
    }

    // Verificar si el artículo ya existe en la categoría actual
    if (!totalPorCategoria[articulo.categoria][articulo.articulo]) {
      totalPorCategoria[articulo.categoria][articulo.articulo] = 0;
    }

    // Sumar la cantidad del artículo dentro de la categoría actual
    totalPorCategoria[articulo.categoria][articulo.articulo] += parseInt(
      articulo.cantidad
    );

    // Verificar si es el último elemento de la categoría actual
    if (
      index === listaDespensa.length - 1 ||
      listaDespensa[index + 1].categoria !== categoriaActual
    ) {
      // Mostrar subtotales por cada artículo dentro de la categoría
      for (const [articuloNombre, cantidad] of Object.entries(
        totalPorCategoria[categoriaActual]
      )) {
        var nuevaFilaSubtotal = document.createElement("tr");
        nuevaFilaSubtotal.innerHTML = `
          <td>${categoriaActual}</td>
          <td><strong>${articuloNombre} (Subtotal)</strong></td>
          <td>${cantidad}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        `;
        tablaDespensa.appendChild(nuevaFilaSubtotal);
      }
    }

    totalGeneral += articulo.costo;
  });

  // Mostrar el total general
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
  console.log("La página ha sido completamente cargada");
  var storedList = localStorage.getItem("listaDespensa");
  var storedArticulosExistentes = localStorage.getItem("articulosExistentes");

  console.log("Datos almacenados en listaDespensa:", storedList);
  console.log(
    "Datos almacenados en articulosExistentes:",
    storedArticulosExistentes
  );

  if (storedList) {
    listaDespensa = JSON.parse(storedList) || [];
  }

  if (storedArticulosExistentes) {
    articulosExistentes = JSON.parse(storedArticulosExistentes) || [];
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
