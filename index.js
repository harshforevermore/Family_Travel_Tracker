import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const dbFamily = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Family",
  password: "sqlconnect",
  port: 5432,
});
const dbCountry = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Travel",
  password: "sqlconnect",
  port: 5432,
});

dbFamily.connect();
dbCountry.connect();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/all-countries", async (req, res) => {
  try {
    const response = await dbCountry.query(
      "SELECT country_name FROM countries;"
    );
    const allCountries = response.rows.map((row) => row.country_name);
    res.json(allCountries);
  } catch (err) {
    console.error("Error Fetching All Countries:", err.stack);
  }
});

app.post("/members-visited-countries", async (req, res) => {
  try {
    const body = req.body.name;
    console.log(body);
    const response = await dbFamily.query(
      "SELECT country_names, country_codes FROM members JOIN visited_countries ON members.id = visited_countries.member_id WHERE names = $1;",
      [body]
    );
    res.json(response);
  } catch (err) {
    console.error("Error fetching members visited countries: -", err);
  }
});

app.get("/", async (req, res) => {
  try {
    const members = await getMembers();
    console.log("members:- ", members);
    res.render("index.ejs", {
      members: members,
    });
  } catch (err) {
    console.error("Error:", err.stack);
  }
});

app.post("/add-country", async (req, res) => {
  try {
    const countryName = capitalizeCountryName(req.body.countryName);
    const memberName = req.body.memberName;
    const id = await getMemberId(memberName);
    const countryCode = await getCountryCode(countryName);
    if (countryCode === "country doesn't exist") {
      res.json("Failed");
    } else {
      const response = await dbFamily.query(
        "INSERT INTO visited_countries(country_names, country_codes, member_id) VALUES($1,$2,$3);",
        [countryName, countryCode, id]
      );
      if (response.rowCount === 1) {
        res.json({ result: "Successful" });
      } else {
        res.json({ result: "Failed" });
      }
    }
  } catch (err) {
    console.error("Error adding country:- ", err);
  }
});
function capitalizeCountryName(name) {
  const exceptions = ['and', 'of', 'in', 'the', 'on', 'at', 'by', 'for', 'with', 'a', 'an'];
  
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Capitalize the first word or any word not in the exceptions list
      if (index === 0 || !exceptions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        return word;
      }
    })
    .join(' ');
}

async function getMemberId(memberName) {
  try {
    const response = await dbFamily.query(
      "SELECT id FROM members WHERE LOWER(names) = LOWER($1);",
      [memberName]
    );
    return response.rows.at(0).id;
  } catch (err) {
    console.error("error getting member id:- ", err);
  }
}
async function getCountryCode(countryName) {
  try {
    const response = await dbCountry.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) = LOWER($1);",
      [countryName]
    );
    if (response.rows.length !== 0) {
      return response.rows.at(0).country_code;
    } else {
      return "country doesn't exist";
    }
  } catch (err) {
    console.error("error getting country code:- ", err);
  }
}

app.post("/add-member", async (req, res) => {
  try {
    const memberName = req.body.name.trim();
    await addMember(memberName);
    res.redirect("/");
  } catch (err) {
    console.error("Error:", err.stack);
  }
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

async function addMember(name) {
  try {
    const memberName = name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    await dbFamily.query("INSERT INTO members(names) VALUES($1);", [
      memberName,
    ]);
  } catch (err) {
    console.error("Error:", err);
  }
}

async function getMembers() {
  try {
    const res = await dbFamily.query("SELECT names FROM members;");
    return res.rows;
  } catch (err) {
    console.error(err);
  }
  return [];
}
