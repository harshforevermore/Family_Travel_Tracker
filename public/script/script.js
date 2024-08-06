let selectedMember = "";
let visitedCountries = [];

function fetchMemberCountries(e) {
  visitedCountries = []; //remove previously added countries
  const countryCodes = [];
  const name = this.textContent;
  selectedMember = name;
  console.log(selectedMember);
  //reset the color of the countries
  document
    .querySelectorAll("li.member")
    .forEach((member) => (member.style.backgroundColor = "teal"));
  //change the color of selected country
  this.style.backgroundColor = "grey";

  fetch("/members-visited-countries", {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({ name: `${name}` }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.rows.length !== 0) {
        data.rows.forEach((row) => {
          countryCodes.push(row.country_codes);
        });
        if (countryCodes.length !== 0) {
          markCountries(countryCodes);
        }

        //add visited countried of the selected member to visitedCountries global variable
        data.rows.forEach((row) => {
          visitedCountries.push(row.country_names);
        });
      }
    })
    .catch((err) =>
      console.log("error fetching member's visited countries:- ", err)
    );
}
function markCountries(countryCodes) {
  document
    .querySelectorAll("path")
    .forEach((element) => (element.style.fill = "#383d46"));
  countryCodes.forEach((code) => {
    document.getElementById(`${code}`).style.fill = "teal";
  });
}

//adding click event to each member to fetch their respective visited countries.
const members = document.querySelectorAll("li.member");
members.forEach((member) => {
  member.addEventListener("click", fetchMemberCountries);
});

//function to filter all the countries for suggestion list
function filterCountries() {
  const suggestions = document.getElementById("suggestions");
  const countryInput = document
    .getElementById("country-input")
    .value.toLowerCase();
  suggestions.style.display = "block";
  document.addEventListener(
    "click",
    () => (suggestions.style.display = "none")
  );
  suggestions.innerHTML = ""; // Clear previous results

  const filteredCountries = allCountries.filter((country) =>
    new RegExp(countryInput, "i").test(country)
  );

  filteredCountries.forEach((country) => {
    const listItem = document.createElement("li");
    listItem.textContent = country;
    listItem.addEventListener("click", () => {
      document.getElementById("country-input").value = country;
      suggestions.style.display = "none"; //hide whenever list item is clicked.
    });
    suggestions.appendChild(listItem);
  });
}

//display members with dropdown menu
function displayMembersList() {
  const membersList = document.querySelector("div.dropdown-list-div");
  const dropdownImage = document.getElementById("dropdown-img");
  dropdownImage.addEventListener("click", () => {
    dropdownImage.classList.toggle("active");
    membersList.style.display =
      membersList.style.display === "block" ? "none" : "block";
  });
}
displayMembersList();

//display new member input field
function displayNewMemberForm() {
  const newMemberForm = document.querySelector("div.add-new-member");
  const newMemberButton = document.getElementById("new-member");
  newMemberButton.addEventListener("click", () => {
    newMemberForm.style.display =
      newMemberForm.style.display === "block" ? "none" : "block";
  });
}
displayNewMemberForm();

//add new country for the selected member
function addCountry() {
  if (selectedMember === "") {
    const alertError = document.querySelector("div.error");
    alertError.innerHTML = `<h2>Select Member</h2>`;
    alertError.style.display = "block";
    alertError.classList.add("error-animation");
    alertError.addEventListener("animationend", () => {
      alertError.classList.remove("error-animation");
      alertError.style.display = "none";
    });
  } else {
    const input = document.getElementById("country-input").value.trim();
    const check = checkAlreadyAdded(input);
    console.log("check:- ", check);
    if (check === "doesn't exist") {
      fetch("/add-country", {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          countryName: input,
          memberName: selectedMember,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.result === "Successful") {
            const alertSuccess = document.querySelector("div.error");
            alertSuccess.innerHTML = `<h2>Successfully Added</h2>`;
            alertSuccess.style.display = "block";
            alertSuccess.classList.add("error-animation");
            alertSuccess.addEventListener("animationend", () => {
              alertSuccess.classList.remove("error-animation");
              alertSuccess.style.display = "none";
            });

            updateVisitedCountries(selectedMember);
          } else {
            const alertError = document.querySelector("div.error");
            alertError.innerHTML = `<h2>Failed!</h2>`;
            alertError.style.display = "block";
            alertError.classList.add("error-animation");
            alertError.addEventListener("animationend", () => {
              alertError.classList.remove("error-animation");
              alertError.style.display = "none";
            });
          }
        })
        .catch((err) => console.error("error:- ", err));
    } else {
        const alertError = document.querySelector("div.error");
        alertError.innerHTML = `<h2>Already Added</h2>`;
        alertError.style.display = "block";
        alertError.classList.add("error-animation");
        alertError.addEventListener("animationend", () => {
          alertError.classList.remove("error-animation");
          alertError.style.display = "none";
        });
    }
  }
}

function checkAlreadyAdded(countryName) {
  const find = visitedCountries.find(
    (country) => country.toLowerCase() === countryName.toLowerCase()
  );
  if (find === undefined) {
    return "doesn't exist";
  } else {
    return "exists";
  }
}

function updateVisitedCountries(member) {
  visitedCountries = []; //remove previously added countries
  const countryCodes = [];
  fetch("/members-visited-countries", {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({ name: `${member}` }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.rows.length !== 0) {
        data.rows.forEach((row) => {
          countryCodes.push(row.country_codes);
        });
        if (countryCodes.length !== 0) {
          markCountries(countryCodes);
        }

        //add visited countried of the selected member to visitedCountries global variable
        data.rows.forEach((row) => {
          visitedCountries.push(row.country_names);
        });
      }
    })
    .catch((err) => console.error("error updating countries:- ", err));
}
