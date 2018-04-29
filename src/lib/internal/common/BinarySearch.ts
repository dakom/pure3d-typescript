//adapted from https://www.geeksforgeeks.org/binary-search/

export const binaryFindIndex = <T>(getValue: ((v: T) => number)) => (arr: Array<T>) => (x: number): number => {
  const _binarySearch = ([l, r]: [number, number]) => {

    if (r >= l) {
      const mid = 0 | (l + (r - l) / 2);
      const value = getValue(arr[mid]);

      return (value == x)
        ? mid
        : (value > x)
          ? _binarySearch([l, mid - 1])
          : _binarySearch([mid + 1, r]);
    }

    return -1;
  }

  return _binarySearch ([0,arr.length-1]);
}

//returns the left and right bounds if there's no _exact_ match, otherwise, the match
export const binaryFindBounds = <T>(getValue: ((v: T) => number)) => (arr: Array<T>) => (x: number): number | [number, number] => {
  const max = arr.length-1;

  const _withinBounds = ([l, r]: [number, number]):boolean => {
    if(l === r) {
      return false;
    }

    if(l < 0 || r < 1) {
      return false;
    }

    const pValue = getValue(arr[l]);
    const nValue = getValue(arr[r]); 

    return (x > pValue && x < nValue);
  } 

  const _binarySearch = ([l, r]: [number, number]) => {
    

    if (r >= l) {
      const mid = 0 | (l + (r - l) / 2);
      const value = getValue(arr[mid]);

      

      if(value == x) {
        return mid;
      }

      if(_withinBounds([mid-1, mid])) {
        return [mid-1, mid];
      }

      if(_withinBounds([mid, mid+1])) {
        return [mid, mid+1];
      }

      return (value > x)
          ? _binarySearch([l, mid - 1])
          : _binarySearch([mid + 1, r]);
    }
    
    return -1;
  }

  return _binarySearch ([0,max]);
}