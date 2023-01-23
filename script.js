const nav = document.querySelector('.nav')
const header = document.getElementById('header')
const title = document.getElementById('title')
const excerpt = document.getElementById('excerpt')
const profile_img = document.getElementById('profile_img')
const name = document.getElementById('name')
const date = document.getElementById('date')
const checkbox = document.querySelector('#check')

const animated_bgs = document.querySelectorAll('.animated-bg')
const animated_bg_texts = document.querySelectorAll('.animated-bg-text')

//to make the navbar sticky
window.addEventListener('scroll', fixNav)

function fixNav(){
    if(window.scrollY > nav.offsetHeight + 150){
        nav.classList.add('active')
    } else {
        nav.classList.remove('active')
    }
}



setTimeout(getData, 2500)

function getData() {
    const cards = document.querySelectorAll('.card');
cards.forEach((card) => {
    const image = card.getAttribute('data-img');
    card.querySelector('#header').innerHTML = `<img src="images/${image}" alt="">`;
    card.querySelector('#title').innerHTML ='Lorem ipsum dolor sit amet.';
    card.querySelector('#excerpt').innerHTML ='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium';
    card.querySelector('#profile_img').innerHTML = '<i class="ri-shopping-cart-2-line"></i>';
    card.querySelector('#name').innerHTML = 'Add to Cart';
    card.querySelector('#date').innerHTML = 'Jan 15, 2023';
});
animated_bgs.forEach(bg => bg.classList.remove('animated-bg'));
animated_bg_texts.forEach(bg => bg.classList.remove('animated-bg-text'))
}

/* 
const sections = {
    'home': document.querySelector("#home"),
    'items': document.querySelector("#items"),
    'products': document.querySelector("#products"),
    'contacts': document.querySelector("#contacts"),
};

function selectPage(page, id){
    var pages = document.querySelectorAll("li");
    for (var i = 0; i < pages.length; i++){
        pages[i].classList.remove("current");
    }
    page.classList.add("current");
    window.scroll({
        top: sections[id].offsetTop - 50,
        behavior: 'smooth'
    });

} */


function toggleMenu(){
    nav.classList.toggle("active");
    checkbox.checked = false;
};















