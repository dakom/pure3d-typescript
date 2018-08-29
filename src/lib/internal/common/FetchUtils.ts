
export const fetchJson = (url:string):Promise<any> =>
    fetchUrl(url).then(response => response.json());

export const fetchArrayBuffer = (url:string):Promise<ArrayBuffer> =>
    fetchUrl(url).then(response => response.arrayBuffer());

export const loadImageFromArrayBuffer = ({data, mimeType}:{data:ArrayBuffer,mimeType:string}): Promise<HTMLImageElement> => new Promise((resolve, reject) => { 
    const img = new Image();
    
    img.addEventListener("load", () => resolve(img));
    
    img.addEventListener("error", reject);

    const arrayBufferView = new Uint8Array( data );
    const blob = new Blob( [ arrayBufferView ], { type: mimeType} );
    const urlCreator = window.URL || (window as any).webkitURL;
    img.src = urlCreator.createObjectURL( blob );
});

export const fetchImage = (url: string):Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    
    const img = new Image();
    
    img.addEventListener("load", () => resolve(img));
    
    img.addEventListener("error", reject);

    if(!sameOrigin(url)) {
        img.crossOrigin = "anonymous";
    }

    img.src = url;
});

export const sameOrigin = (url:string):boolean => 
    url.indexOf("http://") !== -1 || url.indexOf("https://") !== -1
        ?   (getDomUrl(url).origin === window.location.origin)
        :   true;
//Fetch doesn't reject on 404 and other errors, so wrap around it
const _fetch = (url, options):Promise<Response> =>
    fetch(url, options)
        .then(response =>
              response.status >= 200 && response.status < 300
                ?   Promise.resolve(response)
                :   Promise.reject(response.statusText || response.status)
        );

const fetchUrl = (url:string) => _fetch(url, null);

const getDomUrl = (url:string) => {
    const ctor = window.URL || (window as any).webkitURL || window;
    return new ctor(url);
}
   /*
    *
    *
function myFetch(url, options) {
  if (options == null) options = {}
  if (options.credentials == null) options.credentials = 'same-origin'
  return fetch(url, options).then(function(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      var error = new Error(response.statusText || response.status)
      error.response = response
      return Promise.reject(error)
    }
  })
}
*/
