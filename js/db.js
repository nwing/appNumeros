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
    var request = indexedDB.open('AppNumeros', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = tDB.onerror;

      if (db.objectStoreNames.contains('number')) {
        db.deleteObjectStore('number');
      }

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
  tDB.createNumber = function(numero, callback) {
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
      'timestamp': timestamp
    };

    // Enviado registro
    var request = objStore.put(number);

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

  return tDB;
}());
