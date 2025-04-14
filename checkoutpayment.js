const addPri = document.querySelector('.address_primary');
const addSec = document.querySelector('.address_secondary');

const addBg = () => {
	addPri.addEventListener('click', () => {
		addPri.classList.remove('active1');
		addSec.classList.remove('active');
	});

	addSec.addEventListener('click', () => {
		addSec.classList.add('active');
		addPri.classList.add('active1');
	});
};
addBg();