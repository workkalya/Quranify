console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
        }
    }
 
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()));
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        const response = await fetch(`songs/`);
        if (!response.ok) throw new Error("Failed to fetch directory listing");
        const text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.querySelectorAll("a");
        
        let folders = Array.from(anchors).map(anchor => anchor.textContent.trim()).filter(name => name);

        if (folders.length === 0) return;

        let metadataPromises = folders.map(async (folder) => {
            try {
                const metadataResponse = await fetch(`songs/${folder}/info.json`);
                if (!metadataResponse.ok) throw new Error("Metadata not found");
                const metadata = await metadataResponse.json();
                return { folder, metadata };
            } catch (error) {
                console.error(`Error fetching metadata for ${folder}:`, error);
                return null;
            }
        });

        let foldersWithMetadata = (await Promise.all(metadataPromises)).filter(Boolean);

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        foldersWithMetadata.forEach(({ folder, metadata }) => {
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="${metadata.title}" onerror="this.style.display='none';">
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
            </div>`;
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.getAttribute("data-folder");
            await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/Shuraim");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
}

main();
