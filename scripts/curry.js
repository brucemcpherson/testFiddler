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
}
