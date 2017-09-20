function currying() {
  
  // Properties service example
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty ("curryType","vindaloo");
  
  // currying
  
  // first set up a currying function
  function setProp (service) {
    return function(propertyName, propertyValue) {
      var properties = PropertiesService['get' + service + 'Properties']();
      properties.setProperty (propertyName,propertyValue);
    };
  }
  
  // now we can do this
  setProp ("Script") ("curryType" , "vindaloo");

  // now use it to curry some functions
  var setScript = setProp("Script");
  var setUser = setProp ("User");
  var setDocument = setProp ("Document");

  // now each of the curried scripts embeds the properties service to use
  setScript ( "curryType" , "madras");

  // now lets say we want to embed the property name too
  function setType (service) {
    return function (propertyValue) {
      setProp (service) ("curryType", propertyValue);
    };
  }
  
  var saveCurry = setType ("Script");
  saveCurry ("korma");

  
  /**
   * general function to set key/value in given store
   * @param {string} store script, document or user
   * @param {string} key the key
   * @param {number|string|boolean} the value to set
   * @return {PropertiesStore} the store used
   */
  function setPropertyValue (store , key , value) {
    var store = PropertiesService[
      'get' + 
      store.slice (0,1).toUpperCase() + 
      store.slice(1).toLowerCase() + 
      "Properties"
    ]();
    store.setProperty (key , value);
    return store;
  }
  
  // get curry from cUseful library
  var curry = cUseful.Utils.curry;
  
  // all of these work
  setPropertyValue ("script" , "preferredVariety" , "biryani");
  curry (setPropertyValue, "script") ( "preferredVariety" , "biryani");
  curry (setPropertyValue) ("script" , "preferredVariety" , "biryani");
  curry (setPropertyValue) ("script") ( "preferredVariety" , "biryani");
  curry (setPropertyValue) ("script", "preferredVariety" ) ("biryani");
  curry (setPropertyValue) ("script", "preferredVariety" , "biryani");
  curry (setPropertyValue, "script", "preferredVariety" )( "biryani");
  
  // but  becomes useful if we do this
  var setCurriedScript = curry (setPropertyValue , "script");
  setCurriedScript ("preferredVariety" , "bhuna");
  
  // even more
  var setPreferred = curry (setPropertyValue , "script","preferredVariety");
  setPreferred ( "korai");
  
  // or this
  var setPreferred = setCurriedScript("preferredVariety");
  setPreferred ( "dhansak");
  
  // so now we'll change the underlying script to be more useful
  /**
   * general function to set key/value in given store
   * @param {string} store script, document or user
   * @param {string} key the key
   * @param {*} the value to set
   * @return {PropertiesStore} the store used
   */
  function setProperty (store , key , value) {
    var store = PropertiesService[
      'get' + 
      store.slice (0,1).toUpperCase() + 
      store.slice(1).toLowerCase() + 
      "Properties"
    ]();
    // maybe it's an object
    if (typeof value === "object") {
      value = JSON.stringify (value);
    }
    // and might as well exponential back off it
    cUseful.Utils.expBackoff ( function () {
      return store.setProperty (key , value);
    });
    
    return store;
  }
  
  //now curry that
  var setFavorite = curry (setProperty , "script" , "favorite");
  setFavorite ({
    name:"vindaloo",
    spices:[
      "coriander", 
      "cumin", 
      "cinnamon", 
      "mustard", 
      "cayenne", 
      "cardamom", 
      "turmeric", 
      "black pepper" ,
      "cloves"
      ]
  });
  
  // handy to pass to a library so the library doesn't need to get property permissions
  MyLib.setSpices (curry (setProperty , "script" , "favorite") , "dhanask" , ["turmeric", "cinammon", "cardamom"]);
  
}

var MyLib = (function (ns) {

  ns.setSpices = function (setFavorite , name , spices) {
    return setFavorite ( {
      name:name,
      spices:spices
    });
    
  };
  return ns;
})({});


