function testDriveProper () {

  var fileId = '1181bwZspoKoP98o4KuzO0S11IsvE59qCwiw4la9kL4o';
  var DriveProper = new cUseful.DriveProper(Drive);

  // set some properties
  var result = DriveProper.update (fileId, {
    type:"financials",
    region:"eu",
    year:2017
  });
 
  Logger.log (JSON.stringify(result));
  
  // read the again
  Logger.log (JSON.stringify (DriveProper.get (fileId )));
  
  Logger.log (JSON.stringify (DriveProper.search ({type:"financials",region:'eu',year:2017})));
  
  Logger.log (JSON.stringify (DriveProper.remove (fileId, ["year"])));

  
}

