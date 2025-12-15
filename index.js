var divResultados = document.getElementById('feriados-globales');
var selectorMes = document.getElementById('mes-selector');
var esteAnio = new Date().getFullYear();
var nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio","Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function llenarSelector() {
    for (var i = 0; i < nombresMeses.length; i++) {
        var opcion = document.createElement('option');
        opcion.value = i + 1;
        opcion.textContent = nombresMeses[i];
        selectorMes.appendChild(opcion);
    }
    selectorMes.value = new Date().getMonth() + 1; // Seleccionar el mes actual
}

function mostrarFeriadosGlobales(feriados) {
    while (divResultados.firstChild) {
        divResultados.removeChild(divResultados.firstChild);
    }
    
    if (feriados.length === 0) {
        var p = document.createElement('p');
        p.textContent = "No se encontraron feriados en el mes seleccionado.";
        divResultados.appendChild(p);
        return;
    }
    
    //tarjetas
    for (var i = 0; i < feriados.length; i++) {
        var f = feriados[i];
        
        var colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 col-lg-4'; 
        var cardDiv = document.createElement('div');
        cardDiv.className = 'card p-3';

        var h5 = document.createElement('h5');
        h5.textContent = f.localName;

        var pDate = document.createElement('p');
        pDate.className = 'mb-1';
        var strongDate = document.createElement('strong');
        strongDate.textContent = f.date;
        pDate.appendChild(strongDate);

        var pCountry = document.createElement('p');
        pCountry.textContent = f.country;

        // juntar y añadir
        cardDiv.appendChild(h5);
        cardDiv.appendChild(pDate);
        cardDiv.appendChild(pCountry);
        colDiv.appendChild(cardDiv);
        
        divResultados.appendChild(colDiv); 
    }
}

function cargarGlobales() {
    var mesElegido = parseInt(selectorMes.value);
    
    mostrarFeriadosGlobales([]); 
    var pCarga = divResultados.querySelector('p');
    if (pCarga) pCarga.textContent = "Cargando feriados...";


    //Pedir la lista de todos los países
    fetch('https://date.nager.at/api/v3/AvailableCountries')
        .then(function(res) {
            if (!res.ok) throw new Error("Error al obtener países.");
            return res.json();
        })
        .then(function(paises) {
            
            //Crear todas las peticiones para feriados
            var promesas = [];
            for (var i = 0; i < paises.length; i++) {
                var pais = paises[i];
                var url = 'https://date.nager.at/api/v3/PublicHolidays/' + esteAnio + '/' + pais.countryCode;

                var promesa = fetch(url)
                    .then(function(res) { 
                        return res.ok ? res.json() : []; 
                    })
                    .then(function(data) {
                        var feriadosDelMes = [];
                        
                        // Filtrar solo los feriados del mes
                        for (var j = 0; j < data.length; j++) {
                            var f = data[j];
                            var fecha = new Date(f.date);
                            if (fecha.getMonth() + 1 === mesElegido) {
                                feriadosDelMes.push({
                                    date: f.date,
                                    localName: f.localName,
                                    country: pais.name 
                                });
                            }
                        }
                        return feriadosDelMes;
                    })
                    .catch(function(error) {
                        return []; 
                    });
                
                promesas.push(promesa);
            }

            return Promise.all(promesas);
        })

        .then(function(resultados) {
            var listaFinal = [];
            // Juntar todos los resultados en una sola lista
            for (var i = 0; i < resultados.length; i++) {
                listaFinal = listaFinal.concat(resultados[i]);
            }

            // Ordenar por fecha 
            listaFinal.sort(function(a, b) {
                return new Date(a.date) - new Date(b.date);
            });

            mostrarFeriadosGlobales(listaFinal); 
        })
        .catch(function(error) {
            // Mostrar error
            mostrarFeriadosGlobales([]); 
            var pError = divResultados.querySelector('p');
            if (pError) pError.textContent = "Error al cargar feriados. Inténtalo de nuevo.";
        });
}

llenarSelector();
selectorMes.addEventListener('change', cargarGlobales);
cargarGlobales();
