function myFunction() {

  /** untangle the evaluated library
   * recursive
   * necessay because we cant stringify functions
   * @param {object} ob the library var
   * @return {object} untangled object
   */
  function untangle (ob) {

    var source = Object.keys(ob)
      .reduce (function (p,c) {
        
        if (p) p+= ",";
        
        p += keyify(c);
        
        // if its an object, need to to recurse
        if (typeof ob[c] === typeof {} && ob[c] !== null ) {
          p +=   untangle (ob[c]) ;
        }
        
        
        // otherwise copy as is
        else {
          p += valify (ob[c]);
        }
        
        return p;
      },"") ;
      
    return "{" + source + "}";
      
    function keyify (key) {
      return '"' + key + '":';
    }
    
    function valify (value) {
      if (typeof value === 'string') {
        return '"' + value + '"';
      }

      else if (typeof value === "function") {
        return value.toString();
      }
      
      else if (typeof value === 'boolean') {
        return value ? true : false;
      }
      
      else if (typeof value === typeof 'number') {
        return value.toString();
      }
      
      else if (value === null) {
        return "null";
      }
      
      else if (typeof value === typeof undefined) {
        return "undefined";
      }
      
      else {
        throw 'dont know what to do with ' + value;
      }
      
    }
  }

  // get the source code of the library as a namespace
  var sourceCode = "var LocalcUseful=" + untangle (eval(cUseful)) + ";";

  // write it to drive
  DriveApp.createFile("importedcUseful.gs", sourceCode, "text/plain");
}
