"use strict";

import { fetchData } from "./api.js";

const addEventOnElements = function ($elements, eventType, callback) {
  for (const $item of $elements) {
    $item.addEventListener(eventType, callback);
  }
};

// ---------- header scroll ----------
const $header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  $header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

// ---------- search toggle ----------
const $searchToggler = document.querySelector("[data-search-toggler]");
const $searchField = document.querySelector("[data-search-field]");
let isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");
  isExpanded = isExpanded ? false : true;
  this.setAttribute("aria-expanded", isExpanded);
  $searchField.focus();
});

//---------- tab navigation ----------

const $tabBtns = document.querySelectorAll("[data-tab-btn]");
const $tabPanels = document.querySelectorAll("[data-tab-panel]");

let [$lastActiveTabBtn] = $tabBtns;
let [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");

  this.setAttribute("aria-selected", "true");
  const $currentTabPanel = document.querySelector(
    `#${this.getAttribute("aria-controls")}`
  );
  $currentTabPanel.removeAttribute("hidden");

  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});

// keyboard accessibility for tab buttons

addEventOnElements($tabBtns, "keydown", function (e) {
  const $nextElement = this.nextElementSibling;
  const $previousElement = this.$previousElementSibling;

  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", "-1");
    $nextElement.setAttribute("tabindex", "0");
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", "-1");
    $previousElement.setAttribute("tabindex", "0");
    $previousElement.focus();
  }
});

// ---------- Work with API ----------

// #### search

const $searchSubmit = document.querySelector("[data-search-submit]");

let apiUrl = "https://api.github.com/users/jurabekmuhammadov";
let repoUrl,
  followerUrl,
  followingUrl = "";
const searchUser = function () {
  if (!$searchField.value) return;

  apiUrl = `https://api.github.com/users/${$searchField.value}`;
  updateProfile(apiUrl);
};

$searchSubmit.addEventListener("click", searchUser);

// search when press Enter key

$searchField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});

// #### Profile

const $profileCard = document.querySelector("[data-profile-card]");
const $repoPanel = document.querySelector("[data-repo-panel]");
const $error = document.querySelector("[data-error]");

window.updateProfile = function (profileUrl) {
  $error.style.display = "none";
  document.body.style.overflow = "visible";

  //Profile skeleton loader
  $profileCard.innerHTML = `
    <div class="profile-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
      <div class="skeleton text-skeleton text-1"></div>
      <div class="skeleton text-skeleton text-2"></div>
      <div class="skeleton text-skeleton text-3"></div>
    </div>
  `;

  $tabBtns[0].click();

  // Repo card skeleton loader
  $repoPanel.innerHTML = `
    <div class="card repo-skeleton">
      <div class="card-body">
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton text-1"></div>
        <div class="skeleton text-skeleton text-2"></div>
      </div>
      <div class="card-footer">
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
      </div>
    </div>
  `.repeat(6);

  fetchData(
    profileUrl,
    (data) => {
      const {
        type,
        avatar_url,
        name,
        login: username,
        html_url: githubPage,
        bio,
        location,
        company,
        blog: website,
        twitter_username,
        public_repos,
        followers,
        following,
        followers_url,
        following_url,
        repos_url,
      } = data;

      repoUrl = repos_url;
      followerUrl = followers_url;
      followingUrl = following_url.replace("{/other_user}", "");

      $profileCard.innerHTML = `
        <figure class=" ${
          type == "User" ? "avatar-circle" : "avatar-rounded"
        } img-holder" style="--width: 280; --height: 280;">
          <img class="img-cover" src="${avatar_url}" width="280" height="280" alt="${avatar_url}">
        </figure>

        ${name ? `<h1 class="title-2">${name}</h1>` : ""}
        <p class="username text-primary">${username}</p>
        
        ${bio ? `<p class="bio">${bio}</p>` : ""}
        <a href="${githubPage}" target="_blank" class="btn btn-secondary">
          <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
          <span class="span">See on GitHub</span>
        </a>

        <!-- Profile meta -->
        <ul class="profile-meta">
          ${
            location
              ? `<li class="meta-item">
              <span class="material-symbols-rounded" aria-hidden="true">
                location_on
              </span>
              <span class="meta-text">${location}</span>
            </li>`
              : ""
          }

          ${
            company
              ? `
              <li class="meta-item">
              <span class="material-symbols-rounded" aria-hidden="true">
                apartment
              </span>
              <span class="meta-text">${company}</span>
            </li>
            `
              : ""
          }

          ${
            website
              ? `
            <li class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">
              captive_portal
            </span>
            <a href="${website}" target="_blank" class="meta-text">${website.replace(
                  "https://",
                  ""
                )}</a>
          </li>
            `
              : ""
          }

          ${
            twitter_username
              ? `
            <li class="meta-item">
            <span class="icon">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.9441 7.92638C19.9568 8.10403 19.9568 8.28173 19.9568 8.45938C19.9568 13.8781 15.8325 20.1218 8.29441 20.1218C5.97207 20.1218 3.81473 19.4492 2 18.2817C2.32996 18.3198 2.64719 18.3325 2.98984 18.3325C4.90605 18.3325 6.67004 17.6853 8.07867 16.5812C6.27664 16.5431 4.76648 15.3629 4.24617 13.7386C4.5 13.7766 4.75379 13.802 5.02031 13.802C5.38832 13.802 5.75637 13.7512 6.09898 13.6624C4.22082 13.2817 2.81215 11.632 2.81215 9.63958V9.58884C3.35781 9.89341 3.99238 10.0838 4.66492 10.1091C3.56086 9.37306 2.83754 8.11673 2.83754 6.6954C2.83754 5.93399 3.04055 5.23603 3.3959 4.62688C5.41367 7.11419 8.44668 8.73853 11.8477 8.91622C11.7842 8.61165 11.7461 8.29442 11.7461 7.97716C11.7461 5.71825 13.5736 3.87817 15.8451 3.87817C17.0253 3.87817 18.0913 4.3731 18.84 5.17259C19.7664 4.99493 20.6547 4.65228 21.4416 4.18274C21.137 5.13454 20.4898 5.93403 19.6395 6.44161C20.4644 6.35282 21.2639 6.12435 21.9999 5.80712C21.4416 6.61927 20.7436 7.34259 19.9441 7.92638Z"
                  fill="var(--on-background)"></path>
              </svg>
            </span>
            <a href="https://twitter.com/${twitter_username}" target="_blank" class="meta-text">${twitter_username}</a>
          </li>
            `
              : ""
          }
        </ul>

        <!-- Profile stats -->
        <ul class="profile-stats">
          <li class="stats-item">
            <span class="body">${public_repos}</span> Repos
          </li>
          <li class="stats-item">
            <span class="body">${followers}</span> Followers
          </li>
          <li class="stats-item">
            <span class="body">${following}</span> Following
          </li>
        </ul>

        <!-- Profile footer -->
        <div class="footer">
          <p class="copyright">&copy; 2024 jurabekmuhammadov</p>
        </div>  
    `;
      updateRepository();
    },
    () => {
      $error.style.display = "grid";
      document.body.style.overflowY = "hidden";

      $error.innerHTML = `
        <p class="title-1">Oops! :(</p>
        <p class="text">There is no account with username yet.</p>
    `;
    }
  );
};

updateProfile(apiUrl);

// Repositories

let forkedRepos = [];

const updateRepository = function () {
  fetchData(`${repoUrl}?sort=created&per_page=12`, function (data) {
    $repoPanel.innerHTML = `
      <h2 class="sr-only">Repositories</h2>
    `;
    forkedRepos = data.filter((item) => item.fork);

    const repositories = data.filter((i) => !i.fork);

    if (repositories.length) {
      for (const repo of repositories) {
        const {
          name,
          html_url,
          description,
          private: isPrivate,
          language,
          stargazers_count: stars_count,
          forks_count,
        } = repo;
        const $repoCard = document.createElement("article");
        $repoCard.classList.add("card", "repo-card");
        // repo card's body and footer
        $repoCard.innerHTML += `
        <div class="card-body">
              <a href="${html_url}" target="_blank" class="card-title">
                <h3 class="title-3">${name}</h3>
              </a>
              ${
                description
                  ? `
              <p class="card-text">${description}</p>
                
                `
                  : ""
              }
              <span class="badge">${isPrivate ? "Private" : "Public"}</span>
            </div>

            <div class="card-footer">

              ${
                language
                  ? `
                <div class="meta-item">
                  <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                  <span class="span">${language}</span>
                </div>
                `
                  : ""
              }

              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                <span class="span">${stars_count}</span>
              </div>

              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                <span class="span">${forks_count}</span>
              </div>

            </div>
        `;

        $repoPanel.appendChild($repoCard);
      }
    } else {
      // repo error content
      $repoCard.innerHTML = `
          <div class="error-content">
            <p class="title-1">
              Oops! :(
            </p>
            <p class="text">Doesn't have any public Repositories yet.</p>
          </div>
      `;
    }
  });
};

// Forked Repositories

const $forkePanel = document.querySelector("[data-fork-panel]");
const $forkTabBtn = document.querySelector("[data-forked-tab-btn]");

const updateForkRepo = function () {
  $forkePanel.innerHTML = `
    <h2 class="sr-only">Forked Repositories</h2>
  `;

  if (forkedRepos.length) {
    for (const repo of forkedRepos) {
      const {
        name,
        html_url,
        description,
        private: isPrivate,
        language,
        stargazers_count: stars_count,
        forks_count,
      } = repo;

      const $forkCard = document.createElement("article");
      $forkCard.classList.add("card", "repo-card");

      // fork card's body and footer
      $forkCard.innerHTML += `
        <div class="card-body">
              <a href="${html_url}" target="_blank" class="card-title">
                <h3 class="title-3">${name}</h3>
              </a>
              ${
                description
                  ? `
              <p class="card-text">${description}</p>
                
                `
                  : ""
              }
              <span class="badge">${isPrivate ? "Private" : "Public"}</span>
            </div>

            <div class="card-footer">

              ${
                language
                  ? `
                <div class="meta-item">
                  <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                  <span class="span">${language}</span>
                </div>
                `
                  : ""
              }

              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                <span class="span">${stars_count}</span>
              </div>

              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                <span class="span">${forks_count}</span>
              </div>

            </div>
        `;

      $forkePanel.appendChild($forkCard);
    }
  } else {
    // fork error content
    $forkePanel.innerHTML = `
          <div class="error-content">
            <p class="title-1">
              Oops! :(
            </p>
            <p class="text">Doesn't have any public Repositories yet.</p>
          </div>
      `;
  }
};

$forkTabBtn.addEventListener("click", updateForkRepo);

// Followers

const $followerTabBtn = document.querySelector("[data-follower-tab-btn]");
const $followerPanel = document.querySelector("[data-follower-panel]");

const updateFollower = function () {
  // Follower skeleton loader
  $followerPanel.innerHTML = `
    <div class="card follower-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
    </div>
  `.repeat(12);

  fetchData(followerUrl, function (data) {
    $followerPanel.innerHTML = `
      <h2 class="sr-only">Followers</h2>
    `;

    if (data.length) {
      for (const item of data) {
        const { login: username, avatar_url, url } = item;

        const $followerCard = document.createElement("article");
        $followerCard.classList.add("card", "follower-card");

        // follower card' figure, h3 and button
        $followerCard.innerHTML += `
        <figure class="avatar-circle img-holder">
            <img class="img-cover" src="${avatar_url}" width="56" height="56" loading="lazy"
              alt="${username}">
          </figure>
          <h3 class="card-title">${username}</h3>

          <button class="icon-btn" onClick="updateProfile(\'${url}\')" aria-label="Go to ${username}'s profile">
            <span class="material-symbols-rounded" aria-hidden="true">link</span>
          </button>
        `;

        $followerPanel.appendChild($followerCard);
      }
    } else {
      // follower error message
      $followerPanel.innerHTML = `
      <div class="error-content">
          <p class="title-1">Oops! :(</p>
          <p class="text">Doesn't have any follower yet</p>
      </div>
      `;
    }
  });
};

$followerTabBtn.addEventListener("click", updateFollower);

// Following

const $followingTabBtn = document.querySelector("[data-following-tab-btn]");
const $followingPanel = document.querySelector("[data-following-panel]");
const $followingCard = document.createElement("article");
$followingCard.classList.add("card", "follower-card");

const updateFollowing = function () {
  // Following skeleton loader
  $followingPanel.innerHTML = `
    <div class="card follower-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
    </div>
  `.repeat(12);

  fetchData(followingUrl, function (data) {
    $followingPanel.innerHTML += `
      <h2 class="sr-only">Following</h2>
    `;

    if (data.length) {
      for (const item of data) {
        const { login: username, avatar_url, url } = item;

        // following card' figure, h3 and button
        $followingCard.innerHTML = `
        <figure class="avatar-circle img-holder">
            <img class="img-cover" src="${avatar_url}" width="56" height="56" loading="lazy"
              alt="${username}">
          </figure>
          <h3 class="card-title">${username}</h3>

          <button class="icon-btn" onClick="updateProfile(\'${url}\')" aria-label="Go to ${username}'s profile">
            <span class="material-symbols-rounded" aria-hidden="true">link</span>
          </button>
        `;

        $followingPanel.appendChild($followingCard);
      }
    } else {
      // following error message
      $followingPanel.innerHTML = `
      <div class="error-content">
          <p class="title-1">Oops! :(</p>
          <p class="text">Doesn't have any following yet</p>
      </div>
      `;
    }
  });
};

$followingTabBtn.addEventListener("click", updateFollowing);
