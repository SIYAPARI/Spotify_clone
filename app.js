console.log('write js ');
let currentSong=new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(totalSeconds) {
    if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
      return "00:00"; // Handle invalid input
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currfolder=folder;
    
    let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    
    let response = await a.text();

    // 1. Create a temporary DOM element (like a div)
    const tempDiv = document.createElement('div');

    // 2. Set the innerHTML of the temporary div to your response
    tempDiv.innerHTML = response;
    // 3. Now, you can query the temporary div as you would a normal DOM
    const anchorTags = tempDiv.querySelectorAll('a');
    songs = [];
    for (let i = 0; i < anchorTags.length; i++) {
        const element = anchorTags[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);

        }
    }

    let songUL = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
    songUL.innerHTML= "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <div class="song-item">
                                <div class="image-container">
                                    <img class="invert pic-size" src="img/music.svg" alt="music">
                                    <div class="play-icon">
                                        &#9654; <!-- Unicode character for play button -->
                                    </div>
                                </div>
                                <div class="info">
                                    <div> ${song.replaceAll("%20"," ")}</div>
                                    <div></div>
                                </div>
                            </div>
                         </li>`;
    }

    //Attach event listener to each songs 
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
        
    });
    return songs

    

}

//PLAY MUSIC
const playMusic=function playMusic(track,pause=false){
    
    currentSong.src=(`/${currfolder}/`+track);
    if (!pause){
        currentSong.play();
        play.src="img/pause.svg";
    }
    
    document.querySelector(".song-info").innerHTML=decodeURI(track);
    document.querySelector(".song-time").innerHTML="00:00 / 00:00";
    

    
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    
    let response = await a.text();

    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = response;
    let cardContainer=document.querySelector(".card-container");
    let anchors= tempDiv.getElementsByTagName("a");
    
    let array=Array.from(anchors);
    for (let i=0;i<array.length ;i++){
        const e=array[i];
        if(e.href.includes("/songs/")){
           
            let folder=(e.href.split("/").slice(-2)[1]);

            //get metadata of folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
    
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder='${folder}' class="card">

                        <div  id="playDiv" class="play-button">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="jo tum mere ho ">
                        <h2 ">${response.title} </h2>
                        <p >${response.description} </p>
                    </div>`
        }
    };

    //LOADING PLAYLIST
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item =>{
            
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            
        });
    });
    
    
    
    
};
    

async function main() {
    
    await getSongs("songs/eng");
    // console.log(songs);
    playMusic(songs[0],true)

    //DISPLAY ALL ALBUMS  
    displayAlbums()
    

    //ATTACH EVENT LISTENER TO PLAY ,NEXT AND PREVIOUS 
    play.addEventListener("click",()=>{
        if (currentSong.paused){
            currentSong.play();
            play.src="img/pause.svg";

        }
        else{
            currentSong.pause();
            play.src="img/play.svg"
        }
    })

    //LISTEN FOR TIME UPDATION 
    currentSong.addEventListener("timeupdate",()=>{
        currentSong.currentTime,currentSong.duration;
        document.querySelector(".song-time").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left= (currentSong.currentTime/currentSong.duration)*100 +"%"  
        document.querySelector(".progress").style.width = percent + "%";
     });

    //ADD EVENT LISTENER TO SEEK BAR
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent +"%";
        currentSong.currentTime=(currentSong.duration)*percent /100;
    })

    //ADD EVENT LISTENER FOR HAMBURGER
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left='0';
    })

    //ADD EVENT LISTENER FOR CLOSE 
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector('.left').style.left='-130%';
    })

    //ADD EVENT LISTENER FOR previous and next 
    document.querySelector('#previous').addEventListener("click",()=>{
       let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        
        if((index+1)>=0){
            playMusic(songs[index-1]);
        }
        
    })
    document.querySelector('#next').addEventListener("click",()=>{
        currentSong.pause();
        
        let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        
        if((index+1)<songs.length){
            playMusic(songs[index+1]);
        }
    })
    //ADD EVENT TO VOLUME
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
    })
    
    //ADD event listener to mute song 
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
    
    
    


}
main();
