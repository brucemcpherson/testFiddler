var Guid = (function (ns) {

  var b64Digits = ['0','1','2','3','4','5','6','7','8','9'
        , 'A','B','C','D','E','F','G','H','I','J'
        , 'K','L','M','N','O','P','Q','R','S','T'
        , 'U','V','W','X','Y','Z','a','b','c','d'
        , 'e','f','g','h','i','j','k','l','m','n'
        , 'o','p','q','r','s','t','u','v','w','x'
        , 'y','z','_','$'];
  
  ns.fromCompressedGUID = function (compressedGuid) {
  
    if (compressedGuid.length !== 22) throw 'must be 22 chars long ' + compressedGuid + ' was ' + compressedGuid.length;

    var num = [0 , 2 ,6 , 10 ,14, 18]
    .map (function (d) {
      return cvFrom64( compressedGuid, d, d ? 4 : 2 )
    })
   
    var a =  num[0] * 16777216 + num[1];
    var b =  Math.floor(num[2] / 256) ;
    var c =  (num[2] % 256 ) * 256 + Math.floor(num[3] / 65536) ;
    var d =[];
    d[0] =  Math.floor(num[3] / 256 ) % 256 ;
    d[1] =  num[3] % 256 ;
    d[2] = Math.floor(num[4] / 65536) ;
    d[3] = Math.floor(num[4] / 256 ) % 256 ;
    d[4] = num[4] % 256 ;
    d[5] = Math.floor( num[5] / 65536 );
    d[6] = Math.floor( ( num[5] / 256 ) % 256 );
    d[7] = Math.floor( num[5] % 256 );

    return makeGuid ( a , b , c ,  d );
      

  };
  function makeGuid (a,b,c,d) {
    return  padHex (a,8) + "-" + padHex(b,4) + "-" + padHex(c,4) + "-" + 
    padHex (d[0], 2) + 
    padHex (d[1], 2) + "-" + 
    d.slice (2).map(function(e) {
      return padHex (e,2)
    }).join("");

    
  }
  
  
  function padHex (n , dig) {
    return (Array(dig + 1).join("0")  + n.toString(16)).substr(-dig)
  }
  function cvFrom64 ( str , start , len) {
  
    if (len > 4) throw 'length must be <=4';
    return str.slice(start , start+len)
    .split('')
    .reduce(function (p,c) {
      var index = b64Digits.indexOf (c);
      if (index < 0) throw 'invalid digit ' + c;
      return p * 64 + index;
    },0);
    
  }
  return ns;
}) (Guid || {});

function testGuid() {
  
  const testConversions = {
    "0000000000000000000000": "00000000-0000-0000-0000-000000000000",
    "0F3WqC2me920S61GG30W40": "0f0e0d0c-0b0a-0908-0706-050403020100",
    "0ey9sVfFPDdgqxlMM2IzdH": "28f09d9f-a4f6-4d9e-ad3b-bd65824bd9d1"
  };
  
  var converted = Object.keys(testConversions)
  .map (function (k) {
    return Guid.fromCompressedGUID (k);
  });
  
  // check they worked
  var errors = Object.keys(testConversions)
  .filter (function (k,i) {
    return testConversions[k] !== converted[i];
  });
  
  if (errors.length) throw 'failed ' + JSON.stringify(errors);
  
  Logger.log (converted);
}

