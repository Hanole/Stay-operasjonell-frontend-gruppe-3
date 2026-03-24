const modal = document.getElementById ('review-modal') as HTMLElement;
const writeBtn = document.getElementById('write-a-review-btn') as HTMLElement;

writeBtn.addEventListener('click', () => {
    console.log('write-a-review-btn clicked');
    modal.classList.add ('active')});

modal.addEventListener('click', (e) => {
    console.log('modal closed', e.target);
    if (e.target === modal)
    { modal.classList.remove ('active'); }});

const stars = document.querySelectorAll<HTMLSpanElement>('.review-stars span');

let selectedrating = 0;

stars.forEach((star) => {
    star.addEventListener('click', () => {
        selectedrating = Number (star.dataset.value);
        updateStars(selectedrating);
    });
});

function updateStars(rating:number) {
    stars.forEach((star)=> {
        const value= Number (star.dataset.value);
        if (value <= rating) {
            star.classList.add('active');
        }
        else{ star.classList.remove ('active');

        }
    })
}