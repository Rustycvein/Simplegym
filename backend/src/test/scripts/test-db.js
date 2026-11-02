import db from "../../infrastructure/database/sqlite.js";

console.log("Conteo total de ejercicios:");

const count = db.prepare(`
  SELECT COUNT(*) as total FROM exercise_catalog
`).get();

console.log(count);

console.log(" Algunos ejercicios:");

const exercises = db.prepare(`
  SELECT * FROM exercise_catalog LIMIT 5
`).all();

console.log(exercises);

console.log(" Nombres:");

const names = db.prepare(`
  SELECT * FROM exercise_names LIMIT 10
`).all();

console.log(names);

db.close();