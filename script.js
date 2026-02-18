const card=document.querySelector(".card");
const cards=[
    {id:1,
     name:"Rocket",
     image:"images/rocket.jfif"
    },
    {id:2,
     name:"Moon",
     image:"images/moon.jfif"
    },
    {id:3,
     name:"Star",
     image:"images/star.webp"
    },
    {id:4,
     name:"Comet",
     image:"images/comet.jfif"
    }
];
card.addEventListener("click",function(){

    this.classList.toggle("flipped");
});