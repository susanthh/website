import { readFileSync } from "node:fs";

const t = readFileSync("preview/standalone.html", "utf8");
const vars = ["Eu", "xu", "Iu", "wu", "Au", "bu", "Su", "Cu"];
for (const v of vars) {
  const positions = [];
  let idx = 0;
  while ((idx = t.indexOf(v + "=", idx)) !== -1) {
    positions.push(idx);
    idx += 1;
    if (positions.length > 8) break;
  }
  console.log(v, "assignments at:", positions.join(", "));
}
// order of the namespace objects vs the uri strings
const nsIdx = ["Eu", "xu", "Iu", "wu"].map((v) => [v, t.indexOf(v + "=Object.freeze")]);
const uriIdx = ["Au", "bu", "Su", "Cu"].map((v) => [v, t.search(new RegExp("[,;]" + v + '=""?\\+?"data:image'))]);
console.log("namespace obj idx:", JSON.stringify(nsIdx));
console.log("data uri idx:", JSON.stringify(uriIdx));
