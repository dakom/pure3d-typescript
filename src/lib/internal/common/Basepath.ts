//helper for loading each item separately and creating the world manually
export const getBasePath = (path:string):string => {
  const idx1 = (path.lastIndexOf("/") + 1);
  const idx2 = (path.lastIndexOf("\\") + 1);

  return !idx1 && !idx2
    ? path
    : path.substr(0, (idx1 > idx2) ? idx1 : idx2);
}