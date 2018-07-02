import { WebGlRenderer, WebGlConstants } from "lib/Lib"


export const GEOMETRY_BUFFER_ID = Symbol("boxGeom");
export const ELEMENTS_BUFFER_ID = Symbol("boxElements");

export const uploadData = (renderer:WebGlRenderer) => (size:number) => {
    const data = cube(size);

    renderer.buffers.assign(GEOMETRY_BUFFER_ID) ({
        target: WebGlConstants.ARRAY_BUFFER,
        usagePattern: WebGlConstants.STATIC_DRAW,
        data: data.vertexPositions
    });

    renderer.buffers.assign(ELEMENTS_BUFFER_ID) ({
        target: WebGlConstants.ELEMENT_ARRAY_BUFFER,
        usagePattern: WebGlConstants.STATIC_DRAW,
        data: data.indices
    });

    return data;
}

//pulled somewhere off the internet
const cube = (side) => {
   var s = (side || 1)/2;
   var coords = [];
   var normals = [];
   var texCoords = [];
   var indices = [];
   function face(xyz, nrm) {
      var start = coords.length/3;
      var i;
      for (i = 0; i < 12; i++) {
         coords.push(xyz[i]);
      }
      for (i = 0; i < 4; i++) {
         normals.push(nrm[0],nrm[1],nrm[2]);
      }
      texCoords.push(0,0,1,0,1,1,0,1);
      indices.push(start,start+1,start+2,start,start+2,start+3);
   }
   face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
   face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
   face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
   face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
   face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
   face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );
   return {
      vertexPositions: new Float32Array(coords),
      vertexNormals: new Float32Array(normals),
      vertexTextureCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
   }
}
