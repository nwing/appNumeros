'use strict';
/**
 * @Modulo: interaccion con indexedDB
 * @Autor: Antony tasayco cappillo, <antony.exe@gmail.com>
 */
var numberDB = (function() {
  var tDB = {};
  var datastore = null;

  /**
   * Abrir la coneccion de la base de datos
   */
  tDB.open = function(callback) {
    // Version DB
    var version = 1;
    // Nombre de la base de datos
    var request = indexedDB.open('AppNumeros', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = tDB.onerror;

      if (db.objectStoreNames.contains('number')) {
        db.deleteObjectStore('number');
      }
      // Creamos una tabla
      var store = db.createObjectStore('number', {
        keyPath: 'timestamp'
      });
    };

    request.onsuccess = function(e) {
      datastore = e.target.result;

      callback();
    };

    request.onerror = tDB.onerror;
  };


  /**
   * Obtener los numeros guardados en la base de datos
   * @param {callbkack} function
   */
  tDB.fetchNumeros = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['number'], 'readwrite');
    var objStore = transaction.objectStore('number');

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);

    var numeros = [];

    transaction.oncomplete = function(e) {
      callback(numeros);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      
      if (!!result == false) {
        return;
      }
      
      numeros.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = tDB.onerror;
  };


  /**
   * Crear un nuevo registro
   * @param {getNumber} number
   */
  tDB.createNumber = function(numero, status, callback) {
    // Referencia DB
    var db = datastore;

    // Iniciar nueva transaccion
    var transaction = db.transaction(['number'], 'readwrite');

    // Base de datos
    var objStore = transaction.objectStore('number');

    var timestamp = new Date().getTime();
    
    // Creando objeto para nuevo registro
    var number = {
      'numero': numero,
      'status': status,
      'timestamp': timestamp
    };

    // Enviado registro
    var request = objStore.add(number);

    // Si el registro se guardo con existo
    request.onsuccess = function(e) {
      callback(number);
    };

    // Handle errors.
    request.onerror = tDB.onerror;
  };


  /**
   * Eliminar un registro
   * @param {int} id Ttimestamp
   * @param {callbkack} function
   */
  tDB.deleteNumber = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['number'], 'readwrite');
    var objStore = transaction.objectStore('number');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
      callback();
    }
    
    request.onerror = function(e) {
      console.log(e);
    }
  };

  /**
   * Editar un registro
   * @param {int} id Ttimestamp
   * @param {boulean} status
   * @param {callbkack} function
   */
  tDB.editNumber = function(id, status, callback) {
    var db = datastore;
    var transaction = db.transaction(['number'], 'readwrite');
    var objStore = transaction.objectStore('number');

    objStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if(cursor) {
        if(cursor.value.timestamp === id) {
          var updateData = cursor.value;
          var number = {
                'numero': updateData.numero,
                'status': false,
                'timestamp': updateData.timestamp
              };
          var request = objStore.put(number);

          request.onsuccess = function() {
            callback();
          };

          request.onerror = function(e) {
            console.log(e);
          }

        };
        cursor.continue();        
      }
    };
  };

  /**
   * Validar si existe un registro
   * @param {int} id Ttimestamp
   * @param {boulean} status
   * @param {callbkack} function
   */
  tDB.existsNumber = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['number'], 'readwrite');
    var objStore = transaction.objectStore('number');
    var numberArray = [];

    objStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if(cursor) {
        numberArray.push(cursor.value.numero);
        cursor.continue();        
      }
    };

    transaction.oncomplete = function(e) {
      callback(numberArray);
    };
  };

  return tDB;
}());
