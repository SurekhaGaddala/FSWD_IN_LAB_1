
const API_KEY = "YOUR_API_KEY";

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const container = document.getElementById("movieContainer");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  container.innerHTML = "";
  message.textContent = "Loading movies...";

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data = await response.json();

    if (data.Response === "False") {
      message.textContent = data.Error || "No movies found.";
      return;
    }

    const movies = await Promise.all(
      data.Search.map(async (movie) => {
        const url =
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`;

        const res = await fetch(url);
        return res.json();
      })
    );

    container.innerHTML = "";

    movies.forEach((movie) => {
      const card = document.createElement("article");
      card.className = "card";

      const poster =
        movie.Poster && movie.Poster !== "N/A"
          ? movie.Poster
          : "";

      card.innerHTML = `
        <img src="${poster}" alt="Movie poster"
          onerror="this.style.display='none'">
        <h3></h3>
        <p class="rating">⭐ IMDb: ${
          movie.imdbRating || "Not rated"
        }</p>
        <p class="details"></p>
        <p class="details"></p>
      `;

      card.querySelector("h3").textContent = movie.Title;
      card.querySelectorAll(".details")[0].textContent =
        `Year: ${movie.Year} | Genre: ${movie.Genre || "N/A"}`;
      card.querySelectorAll(".details")[1].textContent =
        movie.Plot || "Description unavailable.";

      container.appendChild(card);
    });

    message.textContent = `${movies.length} movies found.`;

  } catch (error) {
    message.textContent =
      "Unable to load movies. Check your internet connection and API key.";
    console.error(error);
  }
});
