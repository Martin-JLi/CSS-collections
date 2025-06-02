let buttons = document.querySelectorAll('button');
let container = document.querySelector('.blob-container');
let animating = false;

buttons.forEach(button => {
  const handleClick = () => {
    const isActive = container.classList.contains(button.id);

    if (!isActive) {
      if (animating) return;
      animating = true;
      buttons.forEach(btn => btn.classList.toggle('active', btn === button));

      container.classList.add('animating', 'animatingSec');

      setTimeout(() => {
        container.classList.remove('animating', 'cards-h', 'cards-v');
        container.classList.add(button.id);
      }, 600);

      setTimeout(() => {
        container.classList.remove('animatingSec');
        animating = false;
      }, 900);
    }   
  };

  button.addEventListener('click', handleClick);
  button.addEventListener('touchstart', handleClick, { passive: true });
});
