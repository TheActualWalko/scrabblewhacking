const letterScores = {
  a : 1,
  b : 3,
  c : 3,
  d : 2,
  e : 1,
  f : 4,
  g : 2,
  h : 4,
  i : 1,
  j : 8,
  k : 5,
  l : 1,
  m : 3,
  n : 1,
  o : 1,
  p : 3,
  q : 10,
  r : 1,
  s : 1,
  t : 1,
  u : 1,
  v : 4,
  w : 2,
  x : 8,
  y : 4,
  z : 10
};

const letterCounts = {
  a : 9,
  b : 3,
  c : 3,
  d : 4,
  e : 12,
  f : 2,
  g : 2,
  h : 2,
  i : 9,
  j : 1,
  k : 2,
  l : 4,
  m : 3,
  n : 6,
  o : 8,
  p : 3,
  q : 1,
  r : 6,
  s : 4,
  t : 6,
  u : 4,
  v : 2,
  w : 5,
  x : 1,
  y : 2,
  z : 1
};

const isValidScrabbleWord = (str)=>{
  const letterCountsForStr = {
    a : 0,
    b : 0,
    c : 0,
    d : 0,
    e : 0,
    f : 0,
    g : 0,
    h : 0,
    i : 0,
    j : 0,
    k : 0,
    l : 0,
    m : 0,
    n : 0,
    o : 0,
    p : 0,
    q : 0,
    r : 0,
    s : 0,
    t : 0,
    u : 0,
    v : 0,
    w : 0,
    x : 0,
    y : 0,
    z : 0
  };
  str.split("").forEach( c=>{
    letterCountsForStr[ c ] ++;
  });
  let isOverLimit = false;
  Object.keys( letterCountsForStr ).forEach( c=>{
    if( letterCountsForStr[c] > letterCounts[c] ){
      isOverLimit = true;
    }
  });
  return !isOverLimit;
};

const fs = require("fs");
const strs = fs.readFileSync( "./words.txt" ).toString().split("\n").filter(str=>isValidScrabbleWord( str ));
strs.sort( (a,b)=>a.length - b.length );

const getSuperStrings = ( strs, sub )=>{
  if( !strs ){
    return [];
  }
  return strs.filter( test=>{
    return test.indexOf( sub ) >= 0;
  });
};

const strsByLength = {};
const strTrie = {};


let length = 0;
let maxLength = 0;
for( let i = 0; i < strs.length; i ++ ){
  if( strs[ i ].length > length ){
    length = strs[ i ].length;
    maxLength = length;
    strsByLength[ length ] = [];
  }
  strsByLength[ length ].push( strs[ i ] );
}

const getScore = ( str )=>{
  return str.split("").reduce( (score, char)=>{
    return letterScores[ char ] + score;
  }, 0)
}

const getPathScore = ( path )=>path.reduce( (score, s)=>score+getScore( s ), 0 );

const paths = {};

const trieify = ( obj, path )=>{
  Object.keys( obj ).forEach( s1=>{
    const output = {};
    getSuperStrings( strsByLength[ s1.length + 1 ], s1 ).forEach( s2=>{
      output[ s2 ] = {};
      //if( paths[ s1 ] !== undefined ){
      //  delete paths[ s1 ];
      //}
      if( 
        paths[ s2 ] === undefined
        ||
        getPathScore( paths[ s2 ] ) <= getPathScore( path.concat( [ s1, s2 ] ) )
      ){
        paths[ s2 ] = path.concat( [ s1, s2 ] );
      }
    });
    trieify( output, path.concat( [s1] ) );
    obj[ s1 ] = output;
  });
}

strsByLength[2].forEach( s=>{
  strTrie[ s ] = {};
});

trieify( strTrie, [] );

const pathList = [];
Object.keys( paths ).forEach( result=>{
  pathList.push( paths[ result ] );
});
pathList.sort( (a, b)=>{
  return getPathScore(b) - getPathScore(a);
});

const scoredPaths = pathList.map( p=>({ path : p, score : getPathScore( p ) }));
const output = `
<html>
  <head>
    <title>Scrabblewhacking!</title>
    <meta charset="utf-8">
    <meta property="og:title" content="Scrabblewhacking: A list of scrabble words" />
    <meta property="og:image" content="http://sam-watkinson.com/images/logo.png" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="...which can be assembled one character at a time, resulting in a scrabble word at each step, ordered by the score of the entire chain." />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      html{
        font-family:"Helvetica Neue", "Helvetica", "Arial", sans-serif;
        text-align:center;
      }
      body{
        padding-top:30px;
      }
      h1{
        font-size:50px;
      }
      h2{
        font-size:25px;
      }
      h3{
        font-size:30px;
      }
      h4{
        font-size:30px;
      }
      body>h1,body>h2,body>h3,body>h4{
        margin:0 auto;
        padding:0;
      }
      body>*{
        width:600px;
        margin:0 auto 20px auto;
      }
      ul{
        list-style-type:none;
        margin:0;
        padding:0;
      }
      li{
        margin:0;
        padding:0;
      }
      dl{
        margin-top:40px;
      }
      dt, dd{
        margin:0;
        padding:0;
      }
      dt{
        font-weight:700;
        margin-bottom:5px;
        font-size:60px;
      }
      dd{
        margin-bottom:20px;
      }
      dd li{
        display:inline-block;
        font-size:13px;
        margin-right:10px;
      }
      dd li:last-of-type{
        font-weight:600;
      }
      body>p{
        font-size:12px;
        margin:120px auto 40px auto;
      }
    </style>
  </head>
  <body>
    <h1>A list of scrabble words</h1>
    <h2>which can be assembled one character at a time</h2>
    <h3>resulting in a scrabble word at each step</h3>
    <h4>ordered by the score of the entire chain</h4>
    <dl>
      ${scoredPaths.map( s=>
      `<dt>${s.path[s.path.length-1]} (${s.score})</dt>
        <dd>
          <ul>
            <li>${s.path.map( s=>`${s} (${getScore(s)})` ).join("</li>\n<li>")}</li>
          </ul>
        </dd>` ).join("\n")}
    </dl>
    <p>
      Thanks for scrolling to the bottom. You're a champ.
    </p>
  </body>
</html>
`;

fs.writeFileSync( "./output.html", output );