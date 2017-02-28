'use strict';
/**
 * @Modulo: appNumeros
 * @Autor: Antony tasayco cappillo, <antony.exe@gmail.com>
 */
(function(){
  var self = {},
      count = 0,
      onloadAnimation = false;

  // Constructor
  self.init = function(){
    numberDB.open(self.refreshNumeros);
    self.saveData();
  };

  // Modulos extras
  self.showModules = function(){
    if(count > 1){
      $('#btnSort').show();
      document.getElementById("btnSort").onclick = function(){
        $('#btnSort').hide();
        self.animateSort("#todo-items", "li", "data-value");
      }
    } else {
      $('#btnSort').hide();
    }
  };

  // Eliminar registros
  self.deleteNumber = function(){
    $('.btnDelete').unbind('click').click(function(){
      var confirmation = confirm('¿Desea eliminar el registro?');
      if (confirmation) {
        var id = parseInt($(this).data("id"));
        numberDB.deleteNumber(id, self.refreshNumeros);
      }
    })
  };

  self.animateSort = function(parent, child, sortAttribute){
    var promises = [];
    var positions = [];
    var originals = $(parent).find(child);
    var sorted = originals.toArray().sort(function(a, b) {
      return $(a).attr(sortAttribute) > $(b).attr(sortAttribute);
    });

    originals.each(function() {
      positions.push($(this).position());
    }).each(function(originalIndex) {
      var $this = $(this);
      var newIndex = sorted.indexOf(this);
      sorted[newIndex] = $this.clone();
      $this.css("position", "absolute").css("top", positions[originalIndex].top + "px").css("left", positions[originalIndex].left + "px");

      var promise = $this.animate({
        top: positions[newIndex].top + "px",
        left: positions[newIndex].left + "px"
      }, 1000);
      promises.push(promise);
    });

    $.when.apply($, promises).done(function() {
      originals.each(function(index) {
        $(this).replaceWith(sorted[index]);
        self.deleteNumber();
      });
      $('#btnSort').show();
    });
  };

  // Guardar numeros
  self.saveData = function(){
    var frmNumber = document.getElementById('new-number-form'),
        txtNumber = document.getElementById('new-number-txt');
    // Enviar formulario
    frmNumber.onsubmit = function() {
      // obtener el valor del input
      var numero = txtNumber.value,
          status = true;

      // Validar si es diferente de vacio
      if (numero.replace(/ /g,'') != '') {
        // Validar si es un numero entero
        if (numero - Math.floor(numero) == 0) {
          // Validamos si el numero no se encuentra en la base de datos
          numberDB.existsNumber(function(numeros){
            if ($.inArray(numero, numeros) != -1){
              alert('Ya se encuentra el numero.');
            } else {
              numberDB.createNumber(numero, status, function() {
                // listamos los registros
                self.refreshNumeros();
              });
            }
          });
        } else {
          alert ("No es un numero entero!");
        }
      }
      // limpiamos el campo
      txtNumber.value = '';
      return false;
    };
  };

  // Mostrar todos los numeros
  self.refreshNumeros = function(){
    numberDB.fetchNumeros(function(numeros) {
      var numberList = document.getElementById('todo-items');
      numberList.innerHTML = '';
      
      // Recoremos los datos
      for(var i = 0; i < numeros.length; i++) {
        // Read the todo items backwards (most recent first).
        var numero = numeros[(numeros.length - 1 - i)];

        var li = document.createElement('li');
        li.className = numero.status == true || onloadAnimation == false ?  "new-item" : "";
        li.setAttribute("data-value", numero.numero);

        var span = document.createElement('span');
        span.innerHTML = numero.numero;
        
        li.appendChild(span);

        var icoDelete = document.createElement('i');
        icoDelete.className = "fa fa-trash btnDelete";
        icoDelete.setAttribute("data-id", numero.timestamp);

        li.appendChild(icoDelete);

        numberList.appendChild(li);

        // Cambiamos el estado de un registro si es nuevo a "FALSE"
        if(numero.status){
          var status = false;
          numberDB.editNumber(numero.timestamp, status, function() {
          });
        }

        // Eliminar registro
        self.deleteNumber();

        count++;
      }
      onloadAnimation = true;
      self.showModules();
    });
  };

  self.init();
})();


