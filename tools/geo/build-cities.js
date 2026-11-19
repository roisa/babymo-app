// Builds www/bm-cities.js: an offline world city list for the prayer-location search.
// Source: GeoNames cities1000 via the all-the-cities package (GeoNames data, CC BY 4.0),
// time zones via geo-tz. Keeps towns of 15,000+ people, every capital, and every
// place GeoNames lists in Indonesia.
// Run (in an empty folder): npm i all-the-cities geo-tz && node build-cities.js <repo>/www/bm-cities.js
const fs = require("fs");
const cities = require("all-the-cities");
const { find } = require("geo-tz");
const out = process.argv[2];

const keep = cities.filter(c =>
  c.population >= 15000 || c.featureCode === "PPLC" || c.featureCode === "PPLA" || c.country === "ID");
keep.sort((a, b) => b.population - a.population);

const tzs = [], tzi = {};
const ccs = new Set();
const rows = keep.map(c => {
  const [lng, lat] = c.loc.coordinates;
  const tz = find(lat, lng)[0] || "";
  if (!(tz in tzi)) { tzi[tz] = tzs.length; tzs.push(tz); }
  ccs.add(c.country);
  const name = c.name.replace(/[|;]/g, " ");
  return [name, c.country, lat.toFixed(3).replace(/\.?0+$/, ""), lng.toFixed(3).replace(/\.?0+$/, ""), tzi[tz], Math.round(c.population / 1000)].join("|");
});

// country names in English and Indonesian, built here so the app needs no Intl.DisplayNames
const en = new Intl.DisplayNames(["en"], { type: "region" }), id = new Intl.DisplayNames(["id"], { type: "region" });
const countries = {};
[...ccs].sort().forEach(cc => { let e = cc, i = cc; try { e = en.of(cc); i = id.of(cc); } catch (x) {} countries[cc] = i === e ? e : e + "|" + i; });

const head = `/* Baby Mo — offline world city list for the prayer-location search.
   ${rows.length} towns: 15,000+ people, every capital and province seat, and every Indonesian town GeoNames lists.
   Row: name|country|lat|lng|time-zone index|population in thousands (biggest first).
   City data © GeoNames (geonames.org), CC BY 4.0. Built by tools/geo/build-cities.js.
   Loaded only when the location sheet needs it. Nothing is sent anywhere. */
`;
const js = head + "window.BMCitiesData={tz:" + JSON.stringify(tzs) + ",cc:" + JSON.stringify(countries) +
  ",rows:" + JSON.stringify(rows.join(";")) + "};\n";
fs.writeFileSync(out, js);
console.log(rows.length, "cities", ccs.size, "countries", tzs.length, "zones", (js.length / 1024).toFixed(0) + " KB");
