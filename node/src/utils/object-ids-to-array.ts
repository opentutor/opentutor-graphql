/*
 * Many requests return a list of ids.
 * The unpolished results from mongo will be a list of objects
 * with just the id field populated, e.g.  [{_id: "id1" }, { _id: "id2" }, ... ].
 * Rather than force the client to parse this,
 * better to convert it to a simple array of strings, e.g. [ "id1", "id2" ]
 */
export default function objectsToIdArray(a: any[]) {
  if (!Array.isArray(a)) {
    console.warn('utils::objectsToIdArray not an array ' + a);
    return [];
  }
  const ids = [];
  for (const i in a) {
    ids.push(a[i]._id);
  }
  return ids;
}
