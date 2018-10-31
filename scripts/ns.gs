// this is a local version of cUseful


function testLocal() {

  // override library version for tests
  this.cUseful = LocalcUseful;
  
  
  testFiddler();
  testPropify();
  testDriveProper();
  
  // this has a problem too
  // checker:errorQualifies
  // since errorQualifies is not defined
  
  //getDataFromApi();
  
  // currying(); doesnt work as it has a recursive and needs to be this.curry.apply
  //,"curry":
  //function () {
  //  return curry.apply(null, Array.prototype.slice.call(arguments));
  //}
  
  
  
}
