const friendsDiv = document.getElementById("friends");
const contestsDiv = document.getElementById("contests");
const addBtn = document.getElementById("addBtn");
const newHandleInput = document.getElementById("newHandle");

function rankClass(rank) {
  if (!rank) return "";
  if (rank.includes("newbie")) return "rank-newbie";
  if (rank.includes("pupil")) return "rank-pupil";
  if (rank.includes("specialist")) return "rank-specialist";
  if (rank.includes("expert")) return "rank-expert";
  if (rank.includes("candidate")) return "rank-candidate";
  if (rank == "master") return "rank-master";
  if (rank == "international master") return "rank-intmaster";
  if (rank == "grandmaster") return "rank-grandmaster";
  if (rank == "international grandmaster") return "rank-intr_grandmaster";
  if (rank.includes("master")) return "rank-leg_grandmaster";
  return "";
}

function getFriends(cb) {
  chrome.storage.sync.get("friends", data => {
    cb(data.friends || []);
  });
}

function setFriends(friends, cb) {
  chrome.storage.sync.set({ friends }, cb);
}

addBtn.onclick = () => {
  const handle = newHandleInput.value.trim();
  if (!handle) return;

  getFriends(friends => {
    if (friends.includes(handle)) return;
    friends.push(handle);
    setFriends(friends, loadFriends);
    newHandleInput.value = "";
  });
};

async function loadFriends() {
  getFriends(async friends => {
    if (friends.length === 0) {
      friendsDiv.innerHTML = "<i>No friends added</i>";
      return;
    }

    friendsDiv.innerHTML = "<i>Loading...</i>";

    const validUsers = [];

    for (const handle of friends) {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${handle}`
        );
        const json = await res.json();

        if (json.status === "OK") {
          validUsers.push(json.result[0]);
        }
      } catch (e) {
        //ignore
      }
    }

    if (validUsers.length === 0) {
      friendsDiv.innerHTML =
        "<i>No valid handles found. Remove invalid ones.</i>";
      return;
    }

    friendsDiv.innerHTML = "";

    validUsers.forEach(u => {
      const div = document.createElement("div");
      div.className = "friend";

      const info = document.createElement("div");
      info.innerHTML = `
        <b>${u.handle}</b><br>
        <small class="${rankClass(u.rank)}">
          ${u.rating || "—"} | ${u.rank || "unrated"}
        </small>
      `;

      const remove = document.createElement("span");
      remove.textContent = "✖";
      remove.className = "remove";
      remove.onclick = () => {
        getFriends(friends => {
          const updated = friends.filter(f => f !== u.handle);
          setFriends(updated, loadFriends);
        });
      };

      div.appendChild(info);
      div.appendChild(remove);
      friendsDiv.appendChild(div);
    });
  });
}


async function loadContests() {
  const res = await fetch("https://codeforces.com/api/contest.list");
  const json = await res.json();

  const upcoming = json.result
    .filter(c => c.phase === "BEFORE")
    .slice(0, 5);

  contestsDiv.innerHTML = "";

  upcoming.forEach(c => {
    const start = new Date(c.startTimeSeconds * 1000);
    const div = document.createElement("div");
    div.className = "contest";
    div.innerHTML = `
      <b>${c.name}</b><br>
      <small>${start.toLocaleString()}</small>
    `;
    contestsDiv.appendChild(div);
  });
}

loadFriends();
loadContests();
