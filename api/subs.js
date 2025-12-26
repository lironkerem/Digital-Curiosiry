// api/subs.js  (returns all endpoints we have)
const subs = new Map(); // same Map we used in save-sub.js
export default async (req,res)=>{
  // quick share across files (simple demo)
  global._pushSubs = global._pushSubs || new Map();
  const list = Array.from(global._pushSubs.values());
  res.json(list);
};