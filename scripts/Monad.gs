// Usage
// Monad() ("Unit Value").bind (func);
function MonadA() {

  // this retutns a function with the value passed to the constructor
  // as the "unit" for this monad
  return function (value) {
  
    // need a an object that doesn't inherit anything from Object
    var ob = Object.create (null);
    
    // this is the function to run against the value passed to the monad constructor
    ob.bind = function (func) {
      // this takes the arguments to bind, removes the first which is the function, then calls the function with 
      // the value from the monad definition,plus any arguments to bind other than the function definition
      return func(value);
    };
    
    // this will have the bind method attached
    return ob;
  }
}

// Usage
// MonadB() ("Unit Value").bind (func [,.. optional args]);
function MonadB() {

  // this retutns a function with the value passed to the constructor
  // as the "unit" for this monad
  return function (value) {
  
    // need a an object that doesn't inherit anything from Object
    var ob = Object.create (null);
    
    // this is the function to run against the value passed to the monad constructor
    ob.bind = function (func) {
      // this takes the arguments to bind, removes the first which is the function, then calls the function with 
      // the value from the monad definition,plus any arguments to bind other than the function definition
      func.apply (null,[value].concat(Array.prototype.slice.call(arguments).slice(1)));
      return ob;
    };
    
    // this will have the bind method attached
    return ob;
  }
}

// Usage
// MonadC([initFunc]) ("Unit Value").bind (func [,.. optional args]);
function MonadC(initFunc) {

  // this returns a function with the value passed to the constructor
  // as the "unit" for this monad
  return function (value) {
  
    // need a an object that doesn't inherit anything from Object
    var ob = Object.create (null);
    
    // this is the function to run against the value passed to the monad constructor
    ob.bind = function (func) {
      // this takes the arguments to bind, removes the first which is the function, then calls the function with 
      // the value from the monad definition,plus any arguments to bind other than the function definition
      func.apply (null,[value].concat(Array.prototype.slice.call(arguments).slice(1)));
      return ob;
    };
    
    // now we can apply the init function if there was one
    // call it passin the monad plus its value
    if (initFunc && typeof initFunc === "function") {
      initFunc (ob , value);
    }
    // this will have the bind method attached
    return ob;
  }
}

function same (a,b) {
  if (a !== b) throw a + " not equal to " + b;
}
// so what is this all about?
function testMonad () {

  // axioms
  // unit(value).bind(f) === f(value);
  // monad.bind(unit) === monad;
  // (monad.bind(f).bind(g)=== monad.bind(function(value) { return f(value).bind(g); }))
 
   function testAxioms (monad , unit , value , f , g) {
     same (f(value) , unit(value).bind(f));
     
   };
   
  // use this for logging result
  function report () {
    Logger.log( Array.prototype.slice.call (arguments)
    .map(function (d) { 
      return typeof d === "object" ? JSON.stringify(d) : d;
    })
    .join ("-"));
  }
  
  
  // simple - but doesn;t do much for us
  var unit = MonadA();
  unit("hello world 1").bind (report);
  var t2 = function (n) { return n*2 };
  report (unit(10).bind(t2));
  testAxioms (unit , 100 , t2);

  
  
  
  
  // can encapsulate the unit value into the monad
  const monad2 = MonadA()("Hello world 2");
  monad2.bind (report);
  
  // now with optional args to bind
  const monad3 = MonadB()("Hello world -B");
  monad3.bind (report,"more B" , "even more B");
  
  // now with an init function 
  const monad4 = MonadC (function (monad , value) {
    report ("in init function:" , value);
  })("Hello world -C").bind (report, " more C"," even more C");
  
  // the maybe monad
  const maybe = MonadC (function (monad , value) {
    // if its null, then we need to change the bind of the monad to do nothing
    monad.nothing  = value === null || typeof value === typeof undefined;
    if (monad.nothing) {
      monad.bind = function () {
        return monad;
      }
    }
  });
  
  // now we can make it ignore nothings
  maybe(null).bind(report);
  maybe(undefined).bind(report);
  
  // whereas this does something
  maybe("something").bind(report);
  
  // monads can have multiple binds
  var person = {
    name:"bruce",
    id:100
  }
  
  // but Im probably breaking some rules here
  maybe(person)
  .bind(report)
  .bind(function (obj, newName) {
    obj.name = newName;
  }, "John")
  .bind(report);

  MonadC()(1).bind(function (n) { return n+1;}).bind(report);
/*  
Left identity:	
return a
>>= f
?	
f a
Right identity:	
m
>>= return
?	
m
Associativity:	
(m >>= f)
>>= g
?	
m >>= (\x -> f x >>= g)

*/
  
  
 
}

