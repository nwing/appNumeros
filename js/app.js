'use strict';
/**
 * @Modulo: app Numeros
 * @Autor: Antony tasayco cappillo, <antony.exe@gmail.com>
 */
(function(){
  var self = {};

  // Constructor
  self.init = function(){
    numberDB.open(self.refreshNumeros);
    self.saveData();
  };

  // Guardar numeros
  self.saveData = function(){
    var frmNumber = document.getElementById('new-number-form'),
        txtNumber = document.getElementById('new-number-txt');
    // Enviar formulario
    frmNumber.onsubmit = function() {
      // obtener el valor del input
      var numero = txtNumber.value;
      // Validar si es diferente de vacio
      if (numero.replace(/ /g,'') != '') {
        // Create the todo item.
        numberDB.createNumber(numero, function(todo) {
          self.refreshNumeros();
        });
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
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.setAttribute("data-id", numero.timestamp);
        
        li.appendChild(checkbox);
        
        var span = document.createElement('span');
        span.innerHTML = numero.numero;
        
        li.appendChild(span);
        
        numberList.appendChild(li);
        // Setup an event listener for the checkbox.
        checkbox.addEventListener('click', function(e) {
          var id = parseInt(e.target.getAttribute('data-id'));
          numberDB.deleteNumber(id, self.refreshNumeros);
        });
      }

    });
  };

  self.init();
})();


