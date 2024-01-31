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

  // Obtener el valor del artículo y convertirlo a minúsculas para comparaciones sin distinción entre mayúsculas y minúsculas
  var articulo = articuloInput.value.toLowerCase();

  // Verificar si el artículo ya existe en la lista de artículos existentes
  if (articulosExistentes.includes(articulo)) {
    // Permitir la adición del mismo artículo
    alert(
      "El artículo ya está en la lista. Se permitirá agregarlo nuevamente."
    );
  }

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

    // Agregar el artículo a la lista de artículos existentes
    articulosExistentes.push(articulo);

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
    if (articulo.categoria !== categoriaActual) {
      categoriaActual = articulo.categoria;
      var espacioCategoria = document.createElement("tr");
      espacioCategoria.innerHTML = `
        <td colspan="6"><strong>${categoriaActual}</strong></td>
        <td></td>
      `;
      tablaDespensa.appendChild(espacioCategoria);
    }

    var nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
      <td>${articulo.categoria}</td>
      <td>${articulo.articulo}</td>
      <td>${articulo.cantidad}</td>
      <td>${articulo.unidadMedida}</td>
      <td>${articulo.fechaCompra}</td>
      <td>${articulo.fechaVencimiento}</td>
      <td>${articulo.costo}</td>
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
        <td colspan="4"></td>
        <td><strong>Total ${categoriaActual}</strong></td>
        <td><strong>${totalPorCategoria[categoriaActual]}</strong></td>
        <td></td>
      `;
      tablaDespensa.appendChild(nuevaFilaTotalCategoria);
    }

    totalGeneral += articulo.costo;
  });

  var nuevaFilaTotalGeneral = document.createElement("tr");
  nuevaFilaTotalGeneral.innerHTML = `
    <td colspan="4"></td>
    <td><strong>Total General</strong></td>
    <td><strong>${totalGeneral}</strong></td>
    <td></td>
  `;

  tablaDespensa.appendChild(nuevaFilaTotalGeneral);

  localStorage.setItem("listaDespensa", JSON.stringify(listaDespensa));
}

function imprimirLista() {
  window.print();
}

function eliminarArticulo(index) {
  listaDespensa.splice(index, 1);
  actualizarListaVisual();
}

window.onload = function () {
  var storedList = localStorage.getItem("listaDespensa");
  if (storedList) {
    listaDespensa = JSON.parse(storedList);
    // Crear la lista de artículos existentes al cargar la página
    articulosExistentes = listaDespensa.map((articulo) =>
      articulo.articulo.toLowerCase()
    );
    actualizarListaVisual();
  }
};
