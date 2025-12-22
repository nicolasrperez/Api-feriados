var selectorPais = document.getElementById('pais');
var listaTodos = document.getElementById('lista-todos');
var listaMes = document.getElementById('lista-mes');
var esteAnio = new Date().getFullYear();
var esteMes = new Date().getMonth() + 1; 

function actualizarLista(elementoUL, feriados, mensajeVacio) {
    while (elementoUL.firstChild) {
        elementoUL.removeChild(elementoUL.firstChild);
    }
    
    if (feriados.length === 0) {
        var li = document.createElement('li');
        li.textContent = mensajeVacio;
        elementoUL.appendChild(li);
        return;
    }

    for (var i = 0; i < feriados.length; i++) {
        var f = feriados[i];
        
        var li = document.createElement('li');
        var strong = document.createElement('strong');
        strong.textContent = f.date; 
        
        li.appendChild(strong);
        li.appendChild(document.createTextNode(' — ' + f.localName)); 

        elementoUL.appendChild(li);
    }
}


function cargarPaises() {
    fetch('https://date.nager.at/api/v3/AvailableCountries')
        .then(function(res) {
            if (!res.ok) throw new Error("Error al cargar países.");
            return res.json();
        })
        .then(function(paises) {
        
            while (selectorPais.firstChild) {
                selectorPais.removeChild(selectorPais.firstChild);
            }
            
        
            var opcionVacia = document.createElement('option');
            opcionVacia.value = "";
            opcionVacia.textContent = "-- Elegir país --";
            selectorPais.appendChild(opcionVacia);

           
            for (var i = 0; i < paises.length; i++) {
                var p = paises[i];
                var opcion = document.createElement('option');
                opcion.value = p.countryCode;
                opcion.textContent = p.name;
                selectorPais.appendChild(opcion);
            }

          
            actualizarLista(listaTodos, [], "Selecciona un país para ver los feriados");
            actualizarLista(listaMes, [], "Selecciona un país para ver los feriados");
        })
        .catch(function(e) {
            var opcionError = document.createElement('option');
            opcionError.textContent = "Error al cargar países";
            selectorPais.appendChild(opcionError);
        });
}


function cargarFeriadosPais() {
    var codigo = selectorPais.value;
    
    if (!codigo) {
        document.body.style.backgroundImage = 'url("https://flagcdn.com/w1600/un.jpg")';
        actualizarLista(listaTodos, [], "Selecciona un país para ver los feriados");
        actualizarLista(listaMes, [], "Selecciona un país para ver los feriados");
        return;
    } 

  
    document.body.style.backgroundImage = 'url("https://flagcdn.com/w1600/' + codigo.toLowerCase() + '.jpg")';


    actualizarLista(listaTodos, [], "Cargando...");
    actualizarLista(listaMes, [], "Cargando...");


    fetch('https://date.nager.at/api/v3/PublicHolidays/' + esteAnio + '/' + codigo)
        .then(function(res) {
            if (!res.ok) throw new Error("Error");
            return res.json();
        })
        .then(function(feriadosAnuales) {
            var feriadosDelMes = [];
            
            
            for (var i = 0; i < feriadosAnuales.length; i++) {
                var f = feriadosAnuales[i];
                var fecha = new Date(f.date);
                
               
                if (fecha.getMonth() + 1 === esteMes) {
                    feriadosDelMes.push(f);
                }
            }

         
            actualizarLista(listaTodos, feriadosAnuales, "No hay feriados este año.");
            actualizarLista(listaMes, feriadosDelMes, "No hay feriados este mes.");

        })
        .catch(function(error) {
            actualizarLista(listaTodos, [], "Error al obtener feriados.");
            actualizarLista(listaMes, [], "Error al obtener feriados.");
        });
}


cargarPaises();
selectorPais.addEventListener('change', cargarFeriadosPais);
